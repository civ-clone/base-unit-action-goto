import {
  StrategyNoteRegistry,
  instance as strategyNoteRegistryInstance,
} from '@civ-clone/core-strategy/StrategyNoteRegistry';
import Action from '@civ-clone/core-unit/Action';
import Move from '@civ-clone/base-unit-action-move/Move';
import NoOrders from '@civ-clone/base-unit-action-no-orders/NoOrders';
import Path from '@civ-clone/core-world-path/Path';
import Unit from '@civ-clone/core-unit/Unit';
import { generateKey } from '../GoTo';

export const moveAlongPath = (
  unit: Unit,
  path: Path,
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
