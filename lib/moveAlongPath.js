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
    while (unit.moves().value() > 0.25) {
        const [move] = unit
            .actions(path.shift())
            .filter((action) => action instanceof Move_1.default);
        if (!move) {
            break;
        }
        move.perform();
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