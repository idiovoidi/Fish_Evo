export class Position extends window.ECSY.Component {
    constructor() {
        super(...arguments);
        this.x = 0;
        this.y = 0;
        this.z = 0;
    }
}
Position.schema = {
    x: { type: window.ECSY.Types.Number, default: 0 },
    y: { type: window.ECSY.Types.Number, default: 0 },
    z: { type: window.ECSY.Types.Number, default: 0 }
};
//# sourceMappingURL=Position.js.map