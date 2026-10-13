import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import City from '@civ-clone/core-city/City';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
import Effect from '@civ-clone/core-rule/Effect';
import GoTo, { generateKey } from '../GoTo';
import Halted from '../Rules/Halted';
import Path from '@civ-clone/core-world-path/Path';
import PathFinder from '@civ-clone/core-world-path/PathFinder';
import PathFinderRegistry from '@civ-clone/core-world-path/PathFinderRegistry';
import Player from '@civ-clone/core-player/Player';
import StrategyNote from '@civ-clone/core-strategy/StrategyNote';
import StrategyNoteRegistry from '@civ-clone/core-strategy/StrategyNoteRegistry';
import Tile from '@civ-clone/core-world/Tile';
import TileImprovementRegistry from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import TransportRegistry from '@civ-clone/core-unit-transport/TransportRegistry';
import Unit from '@civ-clone/core-unit/Unit';
import UnitImprovementRegistry from '@civ-clone/core-unit-improvement/UnitImprovementRegistry';
import UnitRegistry from '@civ-clone/core-unit/UnitRegistry';
import { Warrior } from '@civ-clone/library-unit/Units';
import World from '@civ-clone/core-world/World';
import action from '@civ-clone/civ1-unit/Rules/Unit/action';
import created from '@civ-clone/civ1-unit/Rules/Unit/created';
import { expect } from 'chai';
import moveAlongPath from '../lib/moveAlongPath';
import moved from '@civ-clone/civ1-unit/Rules/Unit/moved';
import movementCost from '@civ-clone/civ1-unit/Rules/Unit/movementCost';
import simpleRLELoader from '@civ-clone/simple-world-generator/tests/lib/simpleRLELoader';
import unitYield from '@civ-clone/civ1-unit/Rules/Unit/yield';
import validateMove from '@civ-clone/civ1-unit/Rules/Unit/validateMove';

// What a journey does on its last step and when it can't go on (civ-clone/web-renderer#357).
describe('GoTo', () => {
  const ruleRegistry = new RuleRegistry(),
    cityRegistry = new CityRegistry(),
    unitRegistry = new UnitRegistry(),
    tileImprovementRegistry = new TileImprovementRegistry(),
    transportRegistry = new TransportRegistry(),
    unitImprovementRegistry = new UnitImprovementRegistry(),
    simpleWorldLoader = simpleRLELoader(ruleRegistry),
    halted: [Unit, Tile][] = [];

  ruleRegistry.register(
    ...movementCost(tileImprovementRegistry, transportRegistry),
    ...action(
      undefined,
      cityRegistry,
      ruleRegistry,
      tileImprovementRegistry,
      undefined,
      unitRegistry
    ),
    ...unitYield(unitImprovementRegistry, ruleRegistry),
    ...moved(transportRegistry, ruleRegistry),
    ...validateMove(() => 0),
    ...created(unitRegistry),
    new Halted(
      new Effect((unit: Unit, target: Tile): void => {
        halted.push([unit, target]);
      })
    )
  );

  // Coordinates, not `Tile`s: a failing assertion on a `Tile` has chai walk the whole world it links to.
  const at = (tile: Tile): [number, number] => [tile.x(), tile.y()];

  // A row of grassland, (1, 1) to (4, 1), with ocean all round.
  const setUp = async (): Promise<{
    world: World;
    unit: Unit;
    path: Tile[];
    notes: StrategyNoteRegistry;
  }> => {
    const world = await simpleWorldLoader('7O4G7O', 3, 6),
      unit = new Warrior(
        null,
        new Player(ruleRegistry),
        world.get(1, 1),
        ruleRegistry
      ),
      path = [world.get(2, 1), world.get(3, 1), world.get(4, 1)],
      notes = new StrategyNoteRegistry();

    halted.splice(0, halted.length);
    notes.register(new StrategyNote(generateKey(unit), path));
    unit.moves().set(3);

    return { world, unit, path, notes };
  };

  const expectHandedBackAt = (
    unit: Unit,
    path: Tile[],
    notes: StrategyNoteRegistry,
    coordinates: [number, number]
  ): void => {
    expect(at(unit.tile())).to.deep.equal(coordinates);
    expect(path.length).to.equal(0);
    expect(notes.getByKey(generateKey(unit)) === undefined).to.be.true;
    expect(unit.active()).to.be.true;
    expect(unit.busy() === null || unit.busy() === undefined).to.be.true;
    expect(unit.moves().value()).to.equal(1);
  };

  it('should stop next to a unit it would attack, and say so', async () => {
    const { world, unit, path, notes } = await setUp(),
      rival = new Warrior(
        null,
        new Player(ruleRegistry),
        world.get(4, 1),
        ruleRegistry
      );

    unitRegistry.register(rival);

    try {
      moveAlongPath(unit, path, notes, ruleRegistry);
    } finally {
      unitRegistry.unregister(rival);
    }

    expectHandedBackAt(unit, path, notes, [3, 1]);
    expect(halted.length).to.equal(1);
    expect(halted[0][0] === unit).to.be.true;
    expect(at(halted[0][1])).to.deep.equal([4, 1]);
  });

  it('should stop next to a city it would capture, and say so', async () => {
    const { world, unit, path, notes } = await setUp(),
      city = new City(
        new Player(ruleRegistry),
        world.get(4, 1),
        'Rival',
        ruleRegistry
      );

    cityRegistry.register(city);

    try {
      moveAlongPath(unit, path, notes, ruleRegistry);
    } finally {
      cityRegistry.unregister(city);
    }

    expectHandedBackAt(unit, path, notes, [3, 1]);
    expect(halted.length).to.equal(1);
    expect(at(halted[0][1])).to.deep.equal([4, 1]);
  });

  it('should move onto the last tile when there is nothing to choose there', async () => {
    const { unit, path, notes } = await setUp();

    moveAlongPath(unit, path, notes, ruleRegistry);

    expect(at(unit.tile())).to.deep.equal([4, 1]);
    expect(halted.length).to.equal(0);
  });

  it('should not leave a unit marked GoTo once its journey has ended on the first leg', async () => {
    const { world, unit, notes } = await setUp(),
      pathFinders = new PathFinderRegistry(),
      rival = new Warrior(
        null,
        new Player(ruleRegistry),
        world.get(3, 1),
        ruleRegistry
      );

    // A route straight through the rival, as an aircraft's used to be.
    class Through extends PathFinder {
      generate(): Path {
        return new Path(
          world.get(1, 1),
          world.get(2, 1),
          world.get(3, 1),
          world.get(4, 1)
        );
      }
    }

    pathFinders.register(Through);
    unitRegistry.register(rival);

    try {
      new GoTo(
        unit.tile(),
        world.get(4, 1),
        unit,
        ruleRegistry,
        pathFinders,
        notes
      ).perform();
    } finally {
      unitRegistry.unregister(rival);
    }

    expect(at(unit.tile())).to.deep.equal([2, 1]);
    expect(notes.getByKey(generateKey(unit)) === undefined).to.be.true;
    expect(unit.active()).to.be.true;
    expect(unit.busy() === null || unit.busy() === undefined).to.be.true;
  });
});
