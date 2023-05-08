"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveAlongPath = void 0;
const Move_1 = require("@civ-clone/base-unit-action-move/Move");
const NoOrders_1 = require("@civ-clone/base-unit-action-no-orders/NoOrders");
const moveAlongPath = (unit, path) => {
    while (unit.moves().value() > 0.25) {
        const [move] = unit
            .actions(path.shift())
            .filter((action) => action instanceof Move_1.default);
        if (!move) {
            break;
        }
        move.perform();
    }
    if (path.length === 0) {
        unit.setBusy();
        unit.setActive();
    }
    if (unit.moves().value() === 0) {
        unit.setActive(false);
        return;
    }
    const [noOrders] = unit
        .actions()
        .filter((action) => action instanceof NoOrders_1.default);
    if (noOrders) {
        noOrders.perform();
        return;
    }
    unit.moves().set(0);
    unit.setActive(false);
};
exports.moveAlongPath = moveAlongPath;
exports.default = exports.moveAlongPath;
//# sourceMappingURL=moveAlongPath.js.map