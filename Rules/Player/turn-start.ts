import {
  StrategyNoteRegistry,
  instance as strategyNoteRegistryInstance,
} from '@civ-clone/core-strategy/StrategyNoteRegistry';
import {
  UnitRegistry,
  instance as unitRegistryInstance,
} from '@civ-clone/core-unit/UnitRegistry';
import Effect from '@civ-clone/core-rule/Effect';
import GoTo from '../../Busy/GoTo';
import Low from '@civ-clone/core-rule/Priorities/Low';
import Path from '@civ-clone/core-world-path/Path';
import Player from '@civ-clone/core-player/Player';
import TurnStart from '@civ-clone/core-player/Rules/TurnStart';
import { generateKey } from '../../GoTo';
import moveAlongPath from '../../lib/moveAlongPath';

export const getRules = (
  strategyNoteRegistry: StrategyNoteRegistry = strategyNoteRegistryInstance,
  unitRegistry: UnitRegistry = unitRegistryInstance
): TurnStart[] => [
  new TurnStart(
    // This needs to have happened after the `Unit`s `Yield`s have been reset.
    new Low(),
    new Effect((player: Player) =>
      unitRegistry.getByPlayer(player).forEach((unit) => {
        if (!(unit.busy() instanceof GoTo)) {
          return;
        }

        const note = strategyNoteRegistry.getByKey<Path>(generateKey(unit));

        if (!note) {
          unit.setBusy();
          unit.setActive();

          return;
        }

        const path = note.value();

        moveAlongPath(unit, path);
      })
    )
  ),
];

export default getRules;
