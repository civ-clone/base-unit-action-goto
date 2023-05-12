import { StrategyNoteRegistry } from '@civ-clone/core-strategy/StrategyNoteRegistry';
import Path from '@civ-clone/core-world-path/Path';
import Unit from '@civ-clone/core-unit/Unit';
export declare const moveAlongPath: (
  unit: Unit,
  path: Path,
  strategyNoteRegistry?: StrategyNoteRegistry
) => void;
export default moveAlongPath;
