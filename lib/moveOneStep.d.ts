import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
export type StepResult = 'moved' | 'failed' | 'blocked' | 'halted';
export declare const moveOneStep: (
  unit: Unit,
  target: Tile,
  last: boolean
) => StepResult;
export default moveOneStep;
