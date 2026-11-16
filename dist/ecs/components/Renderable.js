export class Renderable extends window.ECSY.Component {
    constructor() {
        super(...arguments);
        this.model = null;
        this.scale = 1;
        this.visible = true;
    }
}
Renderable.schema = {
    model: { type: window.ECSY.Types.Ref, default: null },
    scale: { type: window.ECSY.Types.Number, default: 1 },
    visible: { type: window.ECSY.Types.Boolean, default: true }
};
//# sourceMappingURL=Renderable.js.map