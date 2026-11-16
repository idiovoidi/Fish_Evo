export class Health extends window.ECSY.Component {
    constructor() {
        super(...arguments);
        this.current = 100;
        this.max = 100;
        this.regenRate = 0;
        this.isDead = false;
    }
}
Health.schema = {
    current: { type: window.ECSY.Types.Number, default: 100 },
    max: { type: window.ECSY.Types.Number, default: 100 },
    regenRate: { type: window.ECSY.Types.Number, default: 0 },
    isDead: { type: window.ECSY.Types.Boolean, default: false }
};
//# sourceMappingURL=Health.js.map