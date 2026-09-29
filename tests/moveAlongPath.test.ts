import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import CityRegistry from '@civ-clone/core-city/CityRegistry';
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
import { generateKey } from '../GoTo';
import moveAlongPath from '../lib/moveAlongPath';
import moved from '@civ-clone/civ1-unit/Rules/Unit/moved';
import movementCost from '@civ-clone/civ1-unit/Rules/Unit/movementCost';
import simpleRLELoader from '@civ-clone/simple-world-generator/tests/lib/simpleRLELoader';
import unitYield from '@civ-clone/civ1-unit/Rules/Unit/yield';
import validateMove from '@civ-clone/civ1-unit/Rules/Unit/validateMove';

describe('moveAlongPath', () => {
  const ruleRegistry = new RuleRegistry(),
    cityRegistry = new CityRegistry(),
    unitRegistry = new UnitRegistry(),
    tileImprovementRegistry = new TileImprovementRegistry(),
    transportRegistry = new TransportRegistry(),
    unitImprovementRegistry = new UnitImprovementRegistry(),
    simpleWorldLoader = simpleRLELoader(ruleRegistry);

  // What `validateMove` draws when a unit is short of the moves a step costs:
  // high enough fails, 0 always succeeds.
  let roll = 0;

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
    ...validateMove(() => roll),
    ...created(unitRegistry)
  );

  // Ocean all round, and one row of land: (1, 1) grassland, (2, 1) mountains,
  // (3, 1) and (4, 1) grassland.
  //
  //   OOOOOO
  //   OGMGGO
  //   OOOOOO
  // Coordinates, not `Tile`s: a failing assertion on a `Tile` has chai walk
  // the whole world it links to.
  const at = (tile: Tile): [number, number] => [tile.x(), tile.y()],
    along = (path: Tile[]): [number, number][] => path.map(at);

  const setUp = async (): Promise<{
    world: World;
    unit: Unit;
    path: Tile[];
    notes: StrategyNoteRegistry;
  }> => {
    const world = await simpleWorldLoader('7OGM2G7O', 3, 6),
      unit = new Warrior(
        null,
        new Player(ruleRegistry),
        world.get(1, 1),
        ruleRegistry
      ),
      path = [world.get(2, 1), world.get(3, 1), world.get(4, 1)],
      notes = new StrategyNoteRegistry();

    notes.register(new StrategyNote(generateKey(unit), path));
    unit.moves().set(1);

    return { world, unit, path, notes };
  };

  it('should try a tile again next turn when the move onto it fails', async () => {
    const { world, unit, path, notes } = await setUp();

    roll = 0.99;
    moveAlongPath(unit, path, notes);

    expect(at(unit.tile())).to.deep.equal([1, 1]);
    expect(along(path)).to.deep.equal([
      [2, 1],
      [3, 1],
      [4, 1],
    ]);
    expect(notes.getByKey(generateKey(unit)) !== undefined).to.be.true;

    // The next turn.
    roll = 0;
    unit.moves().set(1);
    moveAlongPath(unit, path, notes);

    expect(at(unit.tile())).to.deep.equal([2, 1]);
    expect(along(path)).to.deep.equal([
      [3, 1],
      [4, 1],
    ]);
  });

  it('should follow the path to its end, a tile a turn', async () => {
    const { world, unit, path, notes } = await setUp();

    roll = 0;

    for (let turn = 0; turn < 3; turn++) {
      unit.moves().set(1);
      moveAlongPath(unit, path, notes);
    }

    expect(at(unit.tile())).to.deep.equal([4, 1]);
    expect(along(path)).to.deep.equal([]);
    expect(notes.getByKey(generateKey(unit)) === undefined).to.be.true;
  });

  it('should end the journey and hand the unit back when the next tile cannot be entered', async () => {
    const { world, unit, notes } = await setUp(),
      // Ocean: a Warrior has no `Move` onto it.
      path = [world.get(1, 0), world.get(2, 1)];

    notes.replace(new StrategyNote(generateKey(unit), path));
    unit.setActive(false);
    moveAlongPath(unit, path, notes);

    expect(at(unit.tile())).to.deep.equal([1, 1]);
    expect(along(path)).to.deep.equal([]);
    expect(notes.getByKey(generateKey(unit)) === undefined).to.be.true;
    expect(unit.active()).to.be.true;
  });
});
