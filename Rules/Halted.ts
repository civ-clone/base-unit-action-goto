import Rule from '@civ-clone/core-rule/Rule';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';

/**
 * A `GoTo` stopped one tile short of its destination, because what the unit
 * can do there is more than moving onto it: a Caravan reaching a city building
 * a Wonder, a Diplomat reaching a rival's city, an attack. The unit is awake,
 * with its moves left, so its player can choose, as they would have moving it
 * there by hand.
 */
export class Halted extends Rule<[Unit, Tile], void> {}

export default Halted;
