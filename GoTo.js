"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoTo = exports.goToBusy = exports.generateKey = void 0;
const PathFinderRegistry_1 = require("@civ-clone/core-world-path/PathFinderRegistry");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const StrategyNote_1 = require("@civ-clone/core-strategy/StrategyNote");
const StrategyNoteRegistry_1 = require("@civ-clone/core-strategy/StrategyNoteRegistry");
const Action_1 = require("@civ-clone/core-unit/Action");
const BusyRegistry_1 = require("@civ-clone/core-unit/BusyRegistry");
const GoTo_1 = require("./Busy/GoTo");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Moved_1 = require("@civ-clone/core-unit/Rules/Moved");
const NoPathAvailable_1 = require("./Errors/NoPathAvailable");
const NoPathFinderAvailable_1 = require("./Errors/NoPathFinderAvailable");
const moveAlongPath_1 = require("./lib/moveAlongPath");
const generateKey = (unit) => (0, StrategyNote_1.generateKey)(unit, 'currentPath');
exports.generateKey = generateKey;
/**
 * The `Busy` rule for a unit following a path, built the same way fresh or
 * restored.
 *
 * The criterion reads the remaining path out of the note each time rather than
 * closing over it. That is what makes the rule reconstructible — there is
 * nothing in it but the unit — and it also covers the note being gone, which
 * happens the moment `moveAlongPath` sees the unit arrive: no note means the
 * journey is over, so the effect wakes the unit. `Rules/Player/turn-start`
 * already recovered that way at runtime; this makes the rule agree.
 */
const goToBusy = (unit, strategyNoteRegistry = StrategyNoteRegistry_1.instance) => new GoTo_1.default(new Criterion_1.default(() => {
    var _a;
    const remaining = (_a = strategyNoteRegistry
        .getByKey((0, exports.generateKey)(unit))) === null || _a === void 0 ? void 0 : _a.value();
    return (!(remaining === null || remaining === void 0 ? void 0 : remaining.length) || unit.tile() === remaining[remaining.length - 1]);
}), new Effect_1.default(() => {
    unit.setActive();
    unit.setBusy();
}));
exports.goToBusy = goToBusy;
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
        // The tiles themselves, not the `Path`. A note is saved state now, and
        // `encode` writes a registry held as a field as an array of its members
        // without recording the class — so a stored `Path` would come back as a
        // plain array and `path.end()` would be gone. Everything the journey
        // actually needs is `shift()`, `length` and "the last one", which an array
        // does natively and symmetrically across a save. `entries()` is a copy, so
        // this array is ours to consume.
        const remaining = path.entries();
        // remove the current `Tile` so that the next shift will be the target.
        remaining.shift();
        this._strategyNoteRegistry.replace(new StrategyNote_1.StrategyNote((0, exports.generateKey)(this.unit()), remaining));
        (0, moveAlongPath_1.default)(this.unit(), remaining);
        this.unit().setBusy((0, exports.goToBusy)(this.unit(), this._strategyNoteRegistry));
        this.ruleRegistry().process(Moved_1.default, this.unit(), this);
    }
}
exports.GoTo = GoTo;
// Without this a unit saved mid-journey fails to load. It could not be
// registered before `StrategyNote` became a `DataObject`: the path the
// criterion compares against was never written to the file, so there was
// nothing to rebuild the rule from and inventing a path would have sent the
// unit somewhere it had not been going.
BusyRegistry_1.instance.register(GoTo_1.default, (unit) => (0, exports.goToBusy)(unit));
exports.default = GoTo;
//# sourceMappingURL=GoTo.js.map