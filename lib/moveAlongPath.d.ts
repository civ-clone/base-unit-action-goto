import { StrategyNoteRegistry } from '@civ-clone/core-strategy/StrategyNoteRegistry';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
/**
 * `Tile[]`, not `Path`. The remaining tiles live in a `StrategyNote`, which is
 * saved state, and a `Path` — an `EntityRegistry` of `Tile`s — restores as a
 * plain array because `encode` cannot record the class around a collection.
 * This only ever used `shift()` and `length`, which an array does natively, so
 * taking the array means the same code runs on a fresh journey and a restored
 * one.
 */
export declare const moveAlongPath: (
  unit: Unit,
  path: Tile[],
  strategyNoteRegistry?: StrategyNoteRegistry
) => void;
export default moveAlongPath;
