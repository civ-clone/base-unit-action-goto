import Action from '@civ-clone/core-unit/Action';
import Move from '@civ-clone/base-unit-action-move/Move';
import NoOrders from '@civ-clone/base-unit-action-no-orders/NoOrders';
import Path from '@civ-clone/core-world-path/Path';
import Unit from '@civ-clone/core-unit/Unit';

export const moveAlongPath = (unit: Unit, path: Path): void => {
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
  }

  if (unit.moves().value() === 0) {
    unit.setActive(false);

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
