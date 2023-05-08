"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const StrategyNoteRegistry_1 = require("@civ-clone/core-strategy/StrategyNoteRegistry");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const GoTo_1 = require("../../Busy/GoTo");
const Low_1 = require("@civ-clone/core-rule/Priorities/Low");
const TurnStart_1 = require("@civ-clone/core-player/Rules/TurnStart");
const GoTo_2 = require("../../GoTo");
const moveAlongPath_1 = require("../../lib/moveAlongPath");
const getRules = (strategyNoteRegistry = StrategyNoteRegistry_1.instance, unitRegistry = UnitRegistry_1.instance) => [
    new TurnStart_1.default(
    // This needs to have happened after the `Unit`s `Yield`s have been reset.
    new Low_1.default(), new Effect_1.default((player) => unitRegistry.getByPlayer(player).forEach((unit) => {
        if (!(unit.busy() instanceof GoTo_1.default)) {
            return;
        }
        const note = strategyNoteRegistry.getByKey((0, GoTo_2.generateKey)(unit));
        if (!note) {
            unit.setBusy();
            unit.setActive();
            return;
        }
        const path = note.value();
        (0, moveAlongPath_1.default)(unit, path);
    }))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=turn-start.js.map