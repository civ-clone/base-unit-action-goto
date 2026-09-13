"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
const turn_start_1 = require("./Rules/Player/turn-start");
const core_game_1 = require("@civ-clone/core-game");
const register = (game) => game.rules.register(...(0, turn_start_1.default)(game.strategyNotes, game.units));
exports.register = register;
// The plugin loader imports each package for this side effect. Until it passes
// a `Game` of its own, dropping it would produce a game with silently absent
// rules — no error, just wrong behaviour.
(0, exports.register)(core_game_1.defaultGame);
exports.default = exports.register;
//# sourceMappingURL=registerRules.js.map