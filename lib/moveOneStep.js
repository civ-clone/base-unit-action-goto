"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveOneStep = void 0;
const CaptureCity_1 = require("@civ-clone/base-unit-action-capture-city/CaptureCity");
const Move_1 = require("@civ-clone/base-unit-action-move/Move");
// Moves `unit` one step, onto `target`, a neighbouring tile on its path. `last` says `target` is the end of the path.
//  Shared by every order that follows a path (`moveAlongPath` for GoTo, and orders that work along the way).
const moveOneStep = (unit, target, last) => {
    const actions = unit.actions(target), moves = actions.filter((action) => action instanceof Move_1.default), 
    // Passing through, a plain `Move` is preferred over a more specific one, so an aircraft flies over a city it could
    //  land in (landing would end its turn). On the last tile of the route, or with the unit's last move, the first one
    //  is taken as usual.
    passingThrough = !last && unit.moves().value() > 1, [move] = passingThrough
        ? [
            ...moves.filter((action) => action.constructor === Move_1.default),
            ...moves,
        ]
        : moves;
    // A move of another kind (an aircraft landing, a unit boarding a ship) is still taken.
    if (last &&
        actions.some((action) => !(action instanceof Move_1.default) || action instanceof CaptureCity_1.default)) {
        return 'halted';
    }
    if (!move) {
        return 'blocked';
    }
    move.perform();
    return unit.tile() === target ? 'moved' : 'failed';
};
exports.moveOneStep = moveOneStep;
exports.default = exports.moveOneStep;
//# sourceMappingURL=moveOneStep.js.map