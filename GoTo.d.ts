import { PathFinderRegistry } from '@civ-clone/core-world-path/PathFinderRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { StrategyNoteRegistry } from '@civ-clone/core-strategy/StrategyNoteRegistry';
import Action from '@civ-clone/core-unit/Action';
import BusyGoTo from './Busy/GoTo';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
export declare const generateKey: (unit: Unit) => string;
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
export declare const goToBusy: (
  unit: Unit,
  strategyNoteRegistry?: StrategyNoteRegistry
) => BusyGoTo;
export declare class GoTo extends Action {
  private _pathFinderRegistry;
  private _strategyNoteRegistry;
  constructor(
    from: Tile,
    to: Tile,
    unit: Unit,
    ruleRegistry?: RuleRegistry,
    pathFinderRegistry?: PathFinderRegistry,
    strategyNoteRegistry?: StrategyNoteRegistry
  );
  perform(): void;
}
export default GoTo;
