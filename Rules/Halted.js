"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Halted = void 0;
const Rule_1 = require("@civ-clone/core-rule/Rule");
/**
 * A `GoTo` stopped one tile short of its destination, because what the unit
 * can do there is more than moving onto it: a Caravan reaching a city building
 * a Wonder, a Diplomat reaching a rival's city, an attack. The unit is awake,
 * with its moves left, so its player can choose, as they would have moving it
 * there by hand.
 */
class Halted extends Rule_1.default {
}
exports.Halted = Halted;
exports.default = Halted;
//# sourceMappingURL=Halted.js.map