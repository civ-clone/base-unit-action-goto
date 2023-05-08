"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _GoTo_pathFinderRegistry, _GoTo_strategyNoteRegistry;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoTo = exports.generateKey = void 0;
const PathFinderRegistry_1 = require("@civ-clone/core-world-path/PathFinderRegistry");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const StrategyNote_1 = require("@civ-clone/core-strategy/StrategyNote");
const StrategyNoteRegistry_1 = require("@civ-clone/core-strategy/StrategyNoteRegistry");
const Action_1 = require("@civ-clone/core-unit/Action");
const GoTo_1 = require("./Busy/GoTo");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Moved_1 = require("@civ-clone/core-unit/Rules/Moved");
const NoPathAvailable_1 = require("./Errors/NoPathAvailable");
const NoPathFinderAvailable_1 = require("./Errors/NoPathFinderAvailable");
const moveAlongPath_1 = require("./lib/moveAlongPath");
const generateKey = (unit) => (0, StrategyNote_1.generateKey)(unit, 'currentPath');
exports.generateKey = generateKey;
class GoTo extends Action_1.default {
    constructor(from, to, unit, ruleRegistry = RuleRegistry_1.instance, pathFinderRegistry = PathFinderRegistry_1.instance, strategyNoteRegistry = StrategyNoteRegistry_1.instance) {
        super(from, to, unit, ruleRegistry);
        _GoTo_pathFinderRegistry.set(this, void 0);
        _GoTo_strategyNoteRegistry.set(this, void 0);
        __classPrivateFieldSet(this, _GoTo_pathFinderRegistry, pathFinderRegistry, "f");
        __classPrivateFieldSet(this, _GoTo_strategyNoteRegistry, strategyNoteRegistry, "f");
    }
    perform() {
        const [PathFinder] = __classPrivateFieldGet(this, _GoTo_pathFinderRegistry, "f").entries();
        if (!PathFinder) {
            throw new NoPathFinderAvailable_1.default();
        }
        const path = new PathFinder(this.unit(), this.unit().tile(), this.to()).generate();
        if (!path) {
            throw new NoPathAvailable_1.default();
        }
        this.unit().setBusy();
        // remove the current `Tile` so that the next shift will be the target.
        path.shift();
        __classPrivateFieldGet(this, _GoTo_strategyNoteRegistry, "f").replace(new StrategyNote_1.StrategyNote((0, exports.generateKey)(this.unit()), path));
        (0, moveAlongPath_1.default)(this.unit(), path);
        this.unit().setBusy(new GoTo_1.default(new Criterion_1.default(() => this.unit().tile() === path.end()), new Effect_1.default(() => {
            this.unit().setActive();
            this.unit().setBusy();
        })));
        this.ruleRegistry().process(Moved_1.default, this.unit(), this);
    }
}
exports.GoTo = GoTo;
_GoTo_pathFinderRegistry = new WeakMap(), _GoTo_strategyNoteRegistry = new WeakMap();
exports.default = GoTo;
//# sourceMappingURL=GoTo.js.map