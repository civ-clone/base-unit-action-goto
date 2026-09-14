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
import { instance as busyRegistryInstance } from '@civ-clone/core-unit/BusyRegistry';
import BusyGoTo from './Busy/GoTo';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Moved from '@civ-clone/core-unit/Rules/Moved';
import NoPathAvailable from './Errors/NoPathAvailable';
import NoPathFinderAvailable from './Errors/NoPathFinderAvailable';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
import moveAlongPath from './lib/moveAlongPath';

export const generateKey = (unit: Unit) => generateRawKey(unit, 'currentPath');

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
export const goToBusy = (
  unit: Unit,
  strategyNoteRegistry: StrategyNoteRegistry = strategyNoteRegistryInstance
): BusyGoTo =>
  new BusyGoTo(
    new Criterion((): boolean => {
      const remaining = strategyNoteRegistry
        .getByKey<Tile[]>(generateKey(unit))
        ?.value();

      return (
        !remaining?.length || unit.tile() === remaining[remaining.length - 1]
      );
    }),
    new Effect((): void => {
      unit.setActive();
      unit.setBusy();
    })
  );

export class GoTo extends Action {
  private _pathFinderRegistry: PathFinderRegistry;
  private _strategyNoteRegistry: StrategyNoteRegistry;

  constructor(
    from: Tile,
    to: Tile,
    unit: Unit,
    ruleRegistry: RuleRegistry = ruleRegistryInstance,
    pathFinderRegistry: PathFinderRegistry = pathFinderRegistryInstance,
    strategyNoteRegistry: StrategyNoteRegistry = strategyNoteRegistryInstance
  ) {
    super(from, to, unit, ruleRegistry);

    this._pathFinderRegistry = pathFinderRegistry;
    this._strategyNoteRegistry = strategyNoteRegistry;
  }

  perform(): void {
    const [PathFinder] = this._pathFinderRegistry.entries();

    if (!PathFinder) {
      throw new NoPathFinderAvailable();
    }

    const path = new PathFinder(
      this.unit(),
      this.unit().tile(),
      this.to()
    ).generate();

    if (!path) {
      throw new NoPathAvailable();
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

    this._strategyNoteRegistry.replace(
      new StrategyNote(generateKey(this.unit()), remaining)
    );

    moveAlongPath(this.unit(), remaining);

    this.unit().setBusy(goToBusy(this.unit(), this._strategyNoteRegistry));

    this.ruleRegistry().process(Moved, this.unit(), this);
  }
}

// Without this a unit saved mid-journey fails to load. It could not be
// registered before `StrategyNote` became a `DataObject`: the path the
// criterion compares against was never written to the file, so there was
// nothing to rebuild the rule from and inventing a path would have sent the
// unit somewhere it had not been going.
busyRegistryInstance.register(BusyGoTo, (unit: Unit) => goToBusy(unit));

export default GoTo;
