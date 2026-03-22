export class Age extends window.ECSY.Component {
    constructor() {
        super(...arguments);
        this.value = 0;
        this.maturityAge = 60;
        this.maxAge = 300;
        this.isAdult = false;
    }
}
Age.schema = {
    value: { type: window.ECSY.Types.Number, default: 0 },
    maturityAge: { type: window.ECSY.Types.Number, default: 60 },
    maxAge: { type: window.ECSY.Types.Number, default: 300 },
    isAdult: { type: window.ECSY.Types.Boolean, default: false }
};
//# sourceMappingURL=Age.js.map