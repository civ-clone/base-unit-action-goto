"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveAlongPath = void 0;
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const StrategyNoteRegistry_1 = require("@civ-clone/core-strategy/StrategyNoteRegistry");
const Halted_1 = require("../Rules/Halted");
const NoOrders_1 = require("@civ-clone/base-unit-action-no-orders/NoOrders");
const GoTo_1 = require("../GoTo");
const moveOneStep_1 = require("./moveOneStep");
/**
 * `Tile[]`, not `Path`. The remaining tiles live in a `StrategyNote`, which is
 * saved state, and a `Path` — an `EntityRegistry` of `Tile`s — restores as a
 * plain array because `encode` cannot record the class around a collection.
 * This only ever used `shift()` and `length`, which an array does natively, so
 * taking the array means the same code runs on a fresh journey and a restored
 * one.
 */
const moveAlongPath = (unit, path, strategyNoteRegistry = StrategyNoteRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance) => {
    // The destination, when the journey stops next to it for the player to choose what to do there.
    let haltedAt = null;
    while (path.length > 0 && unit.moves().value() > 0.25) {
        const [target] = path, result = (0, moveOneStep_1.default)(unit, target, path.length === 1);
        // Stopping next to the destination for the player to choose what to do there: hand the unit back.
        if (result === 'halted') {
            haltedAt = target;
            path.splice(0, path.length);
            break;
        }
        // The route no longer works: end the journey below and hand the unit back.
        if (result === 'blocked') {
            path.splice(0, path.length);
            break;
        }
        // The tile stays at the head of the path so the next turn tries it again, and isn't skipped, which would leave the
        //  rest of the path starting somewhere the unit isn't.
        if (result === 'failed') {
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
    if (haltedAt !== null) {
        ruleRegistry.process(Halted_1.default, unit, haltedAt);
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