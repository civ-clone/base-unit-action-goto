import { StrategyNoteRegistry } from '@civ-clone/core-strategy/StrategyNoteRegistry';
import { UnitRegistry } from '@civ-clone/core-unit/UnitRegistry';
import TurnStart from '@civ-clone/core-player/Rules/TurnStart';
export declare const getRules: (
  strategyNoteRegistry?: StrategyNoteRegistry,
  unitRegistry?: UnitRegistry
) => TurnStart[];
export default getRules;
