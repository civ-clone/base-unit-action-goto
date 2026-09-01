"use strict";
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
        this._pathFinderRegistry = pathFinderRegistry;
        this._strategyNoteRegistry = strategyNoteRegistry;
    }
    perform() {
        const [PathFinder] = this._pathFinderRegistry.entries();
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
        this._strategyNoteRegistry.replace(new StrategyNote_1.StrategyNote((0, exports.generateKey)(this.unit()), path));
        (0, moveAlongPath_1.default)(this.unit(), path);
        this.unit().setBusy(new GoTo_1.default(new Criterion_1.default(() => this.unit().tile() === path.end()), new Effect_1.default(() => {
            this.unit().setActive();
            this.unit().setBusy();
        })));
        this.ruleRegistry().process(Moved_1.default, this.unit(), this);
    }
}
exports.GoTo = GoTo;
exports.default = GoTo;
//# sourceMappingURL=GoTo.js.map