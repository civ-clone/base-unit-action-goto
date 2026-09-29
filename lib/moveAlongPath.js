"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveAlongPath = void 0;
const StrategyNoteRegistry_1 = require("@civ-clone/core-strategy/StrategyNoteRegistry");
const Move_1 = require("@civ-clone/base-unit-action-move/Move");
const NoOrders_1 = require("@civ-clone/base-unit-action-no-orders/NoOrders");
const GoTo_1 = require("../GoTo");
/**
 * `Tile[]`, not `Path`. The remaining tiles live in a `StrategyNote`, which is
 * saved state, and a `Path` — an `EntityRegistry` of `Tile`s — restores as a
 * plain array because `encode` cannot record the class around a collection.
 * This only ever used `shift()` and `length`, which an array does natively, so
 * taking the array means the same code runs on a fresh journey and a restored
 * one.
 */
const moveAlongPath = (unit, path, strategyNoteRegistry = StrategyNoteRegistry_1.instance) => {
    while (path.length > 0 && unit.moves().value() > 0.25) {
        const [target] = path, moves = unit
            .actions(target)
            .filter((action) => action instanceof Move_1.default), 
        // Passing through, a plain `Move` is preferred over a more specific one, so an aircraft flies over a city it
        // could land in (landing would end its turn). On the last tile of the route, or with the unit's last move, the
        // first one is taken as usual.
        passingThrough = path.length > 1 && unit.moves().value() > 1, [move] = passingThrough
            ? [
                ...moves.filter((action) => action.constructor === Move_1.default),
                ...moves,
            ]
            : moves;
        if (!move) {
            // Nothing can move onto the next tile (another player's unit is on it,
            // say), so the route no longer works: end the journey below and hand the
            // unit back.
            path.splice(0, path.length);
            break;
        }
        move.perform();
        // A move can fail: a unit short of the moves a tile costs only gets there
        // by chance, and loses the rest of its turn either way. The tile stays at
        // the head of the path so the next turn tries it again, and isn't skipped,
        // which would leave the rest of the path starting somewhere the unit isn't.
        if (unit.tile() !== target) {
            break;
        }
        path.shift();
    }
    if (path.length === 0) {
        unit.setBusy();
        unit.setActive();
        const note = strategyNoteRegistry.getByKey((0, GoTo_1.generateKey)(unit));
        if (note) {
            strategyNoteRegistry.unregister(note);
        }
    }
    if (unit.moves().value() > 0.25) {
        return;
    }
    const [noOrders] = unit
        .actions()
        .filter((action) => action instanceof NoOrders_1.default);
    if (noOrders) {
        noOrders.perform();
        return;
    }
    unit.moves().set(0);
    unit.setActive(false);
};
exports.moveAlongPath = moveAlongPath;
exports.default = exports.moveAlongPath;
//# sourceMappingURL=moveAlongPath.js.map