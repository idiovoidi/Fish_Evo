export class PredatorState extends window.ECSY.Component {
    constructor() {
        super(...arguments);
        this.lastBiteTime = 0;
        this.biteCooldown = 2000;
        this.huntingTarget = null;
        this.chaseSpeed = 10;
        this.lastAttackTime = 0;
        this.isChasing = false;
    }
}
PredatorState.schema = {
    lastBiteTime: { type: window.ECSY.Types.Number, default: 0 },
    biteCooldown: { type: window.ECSY.Types.Number, default: 2000 },
    huntingTarget: { type: window.ECSY.Types.Ref, default: null },
    chaseSpeed: { type: window.ECSY.Types.Number, default: 10 },
    lastAttackTime: { type: window.ECSY.Types.Number, default: 0 },
    isChasing: { type: window.ECSY.Types.Boolean, default: false }
};
//# sourceMappingURL=PredatorState.js.map