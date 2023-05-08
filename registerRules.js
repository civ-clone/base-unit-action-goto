"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const turn_start_1 = require("./Rules/Player/turn-start");
RuleRegistry_1.instance.register(...(0, turn_start_1.default)());
//# sourceMappingURL=registerRules.js.map