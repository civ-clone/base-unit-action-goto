import {
  PathFinderRegistry,
  instance as pathFinderRegistryInstance,
} from '@civ-clone/core-world-path/PathFinderRegistry';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  StrategyNote,
  generateKey as generateRawKey,
} from '@civ-clone/core-strategy/StrategyNote';
import {
  StrategyNoteRegistry,
  instance as strategyNoteRegistryInstance,
} from '@civ-clone/core-strategy/StrategyNoteRegistry';
import Action from '@civ-clone/core-unit/Action';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
import moveAlongPath from './lib/moveAlongPath';

export const generateKey = (unit: Unit) => generateRawKey(unit, 'currentPath');

export class GoTo extends Action {
  #pathFinderRegistry: PathFinderRegistry;
  #strategyNoteRegistry: StrategyNoteRegistry;

  constructor(
    from: Tile,
    to: Tile,
    unit: Unit,
    ruleRegistry: RuleRegistry = ruleRegistryInstance,
    pathFinderRegistry: PathFinderRegistry = pathFinderRegistryInstance,
    strategyNoteRegistry: StrategyNoteRegistry = strategyNoteRegistryInstance
  ) {
    super(from, to, unit, ruleRegistry);

    this.#pathFinderRegistry = pathFinderRegistry;
    this.#strategyNoteRegistry = strategyNoteRegistry;
  }

  perform(): void {
    const [PathFinder] = this.#pathFinderRegistry.entries();

    if (!PathFinder) {
      // TODO: shout about this?
      return;
    }

    const path = new PathFinder(
      this.unit(),
      this.unit().tile(),
      this.to()
    ).generate();

    if (!path) {
      // TODO: shout about this?
      return;
    }

    // remove the current `Tile` so that the next shift will be the target.
    path.shift();

    this.#strategyNoteRegistry.replace(
      new StrategyNote(generateKey(this.unit()), path)
    );

    moveAlongPath(this.unit(), path);
  }
}

export default GoTo;
