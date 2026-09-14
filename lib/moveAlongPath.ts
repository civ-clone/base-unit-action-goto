import {
  StrategyNoteRegistry,
  instance as strategyNoteRegistryInstance,
} from '@civ-clone/core-strategy/StrategyNoteRegistry';
import Action from '@civ-clone/core-unit/Action';
import Move from '@civ-clone/base-unit-action-move/Move';
import NoOrders from '@civ-clone/base-unit-action-no-orders/NoOrders';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
import { generateKey } from '../GoTo';

/**
 * `Tile[]`, not `Path`. The remaining tiles live in a `StrategyNote`, which is
 * saved state, and a `Path` — an `EntityRegistry` of `Tile`s — restores as a
 * plain array because `encode` cannot record the class around a collection.
 * This only ever used `shift()` and `length`, which an array does natively, so
 * taking the array means the same code runs on a fresh journey and a restored
 * one.
 */
export const moveAlongPath = (
  unit: Unit,
  path: Tile[],
  strategyNoteRegistry: StrategyNoteRegistry = strategyNoteRegistryInstance
): void => {
  while (unit.moves().value() > 0.25) {
    const [move] = unit
      .actions(path.shift())
      .filter(
        (action: Action | Move): action is Move => action instanceof Move
      );

    if (!move) {
      break;
    }

    move.perform();
  }

  if (path.length === 0) {
    unit.setBusy();
    unit.setActive();

    const note = strategyNoteRegistry.getByKey(generateKey(unit));

    if (note) {
      strategyNoteRegistry.unregister(note);
    }
  }

  if (unit.moves().value() > 0.25) {
    return;
  }

  const [noOrders] = unit
    .actions()
    .filter((action): action is NoOrders => action instanceof NoOrders);

  if (noOrders) {
    noOrders.perform();

    return;
  }

  unit.moves().set(0);
  unit.setActive(false);
};

export default moveAlongPath;
