export class Velocity extends window.ECSY.Component {
    constructor() {
        super(...arguments);
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.maxSpeed = 5;
    }
}
Velocity.schema = {
    x: { type: window.ECSY.Types.Number, default: 0 },
    y: { type: window.ECSY.Types.Number, default: 0 },
    z: { type: window.ECSY.Types.Number, default: 0 },
    maxSpeed: { type: window.ECSY.Types.Number, default: 5 }
};
//# sourceMappingURL=Velocity.js.map