import { generateKey, restoreGoTo } from '../GoTo';
import BusyGoTo from '../Busy/GoTo';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import StrategyNote from '@civ-clone/core-strategy/StrategyNote';
import StrategyNoteRegistry, {
  instance as strategyNoteRegistryInstance,
} from '@civ-clone/core-strategy/StrategyNoteRegistry';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
import World from '@civ-clone/core-world/World';
import { expect } from 'chai';

class Walker extends Unit {}

// A save loaded into a game with its own registries follows that game's route note (civ-clone/web-renderer#248).
describe('GoTo loaded into another game', (): void => {
  const setUp = () => {
    const world = null as unknown as World,
      start = new Tile(0, 0, new Terrain(), world),
      destination = new Tile(1, 0, new Terrain(), world),
      unit = new Walker(null, new Player(), start, new RuleRegistry());

    return { destination, unit };
  };

  it("keeps the unit going while the loading game's note has a route, whatever the module instance holds", (): void => {
    const { destination, unit } = setUp(),
      strategyNotes = new StrategyNoteRegistry();

    strategyNotes.register(new StrategyNote(generateKey(unit), [destination]));

    const busy = restoreGoTo(unit, { strategyNotes });

    expect(busy).to.instanceof(BusyGoTo);
    expect(strategyNoteRegistryInstance.getByKey(generateKey(unit))).to.be
      .undefined;
    // The criterion says when to stop: still a way to go, so it does not.
    expect(busy.validate()).to.false;
  });

  it("lets the unit go when the loading game's note has no route, even if the module instance has one", (): void => {
    const { destination, unit } = setUp(),
      instanceNote = new StrategyNote(generateKey(unit), [destination]);

    strategyNoteRegistryInstance.register(instanceNote);

    try {
      const busy = restoreGoTo(unit, {
        strategyNotes: new StrategyNoteRegistry(),
      });

      expect(busy.validate()).to.true;
    } finally {
      strategyNoteRegistryInstance.unregister(instanceNote);
    }
  });
});
