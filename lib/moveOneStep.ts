import Action from '@civ-clone/core-unit/Action';
import CaptureCity from '@civ-clone/base-unit-action-capture-city/CaptureCity';
import Move from '@civ-clone/base-unit-action-move/Move';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';

// What came of one step along a path (`moveOneStep`):
//  - `moved`: the unit is on `target`;
//  - `failed`: it tried and didn't get there (a unit short of the moves a tile costs only gets there by chance, and
//    loses the rest of its turn either way), so the same step can be tried again next turn;
//  - `blocked`: nothing can move onto `target` (another player's unit is on it, say), so the route no longer works;
//  - `halted`: `target` is the last tile and offers more than a move (a Caravan's Help build Wonder, a Diplomat's
//    actions, an attack, capturing a city), so the unit stops short for its player to choose.
export type StepResult = 'moved' | 'failed' | 'blocked' | 'halted';

// Moves `unit` one step, onto `target`, a neighbouring tile on its path. `last` says `target` is the end of the path.
//  Shared by every order that follows a path (`moveAlongPath` for GoTo, and orders that work along the way).
export const moveOneStep = (
  unit: Unit,
  target: Tile,
  last: boolean
): StepResult => {
  const actions = unit.actions(target),
    moves = actions.filter(
      (action: Action | Move): action is Move => action instanceof Move
    ),
    // Passing through, a plain `Move` is preferred over a more specific one, so an aircraft flies over a city it could
    //  land in (landing would end its turn). On the last tile of the route, or with the unit's last move, the first one
    //  is taken as usual.
    passingThrough = !last && unit.moves().value() > 1,
    [move] = passingThrough
      ? [
          ...moves.filter(
            (action: Move): boolean => action.constructor === Move
          ),
          ...moves,
        ]
      : moves;

  // A move of another kind (an aircraft landing, a unit boarding a ship) is still taken.
  if (
    last &&
    actions.some(
      (action: Action): boolean =>
        !(action instanceof Move) || action instanceof CaptureCity
    )
  ) {
    return 'halted';
  }

  if (!move) {
    return 'blocked';
  }

  move.perform();

  return unit.tile() === target ? 'moved' : 'failed';
};

export default moveOneStep;
