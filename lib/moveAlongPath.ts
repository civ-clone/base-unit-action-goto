import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  StrategyNoteRegistry,
  instance as strategyNoteRegistryInstance,
} from '@civ-clone/core-strategy/StrategyNoteRegistry';
import Halted from '../Rules/Halted';
import NoOrders from '@civ-clone/base-unit-action-no-orders/NoOrders';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
import { generateKey } from '../GoTo';
import moveOneStep from './moveOneStep';

/**
 * `Tile[]`, not `Path`. The remaining tiles live in a `StrategyNote`, which is
 * saved state, and a `Path` — an `EntityRegistry` of `Tile`s — restores as a
 * plain array because `encode` cannot record the class around a collection.
 * This only ever used `shift()` and `length`, which an array does natively, so
 * taking the array means the same code runs on a fresh journey and a restored
 * one.
 */
export const moveAlongPath = (
  unit: Unit,
  path: Tile[],
  strategyNoteRegistry: StrategyNoteRegistry = strategyNoteRegistryInstance,
  ruleRegistry: RuleRegistry = ruleRegistryInstance
): void => {
  // The destination, when the journey stops next to it for the player to choose what to do there.
  let haltedAt: Tile | null = null;

  while (path.length > 0 && unit.moves().value() > 0.25) {
    const [target] = path,
      result = moveOneStep(unit, target, path.length === 1);

    // Stopping next to the destination for the player to choose what to do there: hand the unit back.
    if (result === 'halted') {
      haltedAt = target;
      path.splice(0, path.length);
      break;
    }

    // The route no longer works: end the journey below and hand the unit back.
    if (result === 'blocked') {
      path.splice(0, path.length);
      break;
    }

    // The tile stays at the head of the path so the next turn tries it again, and isn't skipped, which would leave the
    //  rest of the path starting somewhere the unit isn't.
    if (result === 'failed') {
      break;
    }

    path.shift();
  }

  if (path.length === 0) {
    unit.setBusy();
    unit.setActive();

    const note = strategyNoteRegistry.getByKey(generateKey(unit));

    if (note) {
      strategyNoteRegistry.unregister(note);
    }
  }

  if (haltedAt !== null) {
    ruleRegistry.process(Halted, unit, haltedAt);
  }

  if (unit.moves().value() > 0.25) {
    return;
  }

  const [noOrders] = unit
    .actions()
    .filter((action): action is NoOrders => action instanceof NoOrders);

  if (noOrders) {
    noOrders.perform();

    return;
  }

  unit.moves().set(0);
  unit.setActive(false);
};

export default moveAlongPath;
