export class Hunger extends window.ECSY.Component {
    constructor() {
        super(...arguments);
        this.value = 0;
        this.rate = 0.01;
        this.lastFed = 0;
    }
}
Hunger.schema = {
    value: { type: window.ECSY.Types.Number, default: 0 },
    rate: { type: window.ECSY.Types.Number, default: 0.01 },
    lastFed: { type: window.ECSY.Types.Number, default: 0 }
};
//# sourceMappingURL=Hunger.js.map