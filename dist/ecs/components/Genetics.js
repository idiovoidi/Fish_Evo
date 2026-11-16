export class Genetics extends window.ECSY.Component {
    constructor() {
        super(...arguments);
        this.size = 1;
        this.speed = 5;
        this.metabolism = 1;
        this.color = [100, 180, 255];
    }
}
Genetics.serializable = true;
Genetics.schema = {
    size: { type: window.ECSY.Types.Number, default: 1 },
    speed: { type: window.ECSY.Types.Number, default: 5 },
    metabolism: { type: window.ECSY.Types.Number, default: 1 },
    color: { type: window.ECSY.Types.Ref, default: [100, 180, 255] }
};
//# sourceMappingURL=Genetics.js.map