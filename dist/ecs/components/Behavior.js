export class Behavior extends window.ECSY.Component {
    constructor() {
        super(...arguments);
        this.isHungry = false;
        this.isFleeing = false;
        this.isSchooling = false;
        this.isResting = false;
        this.isMating = false;
        this.schoolingPreference = 0.8;
        this.personalSpace = 1.0;
        this.lastBreedTime = 0;
        this.breedCooldown = 30000;
        this.aggressionLevel = 0.0;
        this.huntingRadius = 5.0;
    }
}
Behavior.schema = {
    isHungry: { type: window.ECSY.Types.Boolean, default: false },
    isFleeing: { type: window.ECSY.Types.Boolean, default: false },
    isSchooling: { type: window.ECSY.Types.Boolean, default: false },
    isResting: { type: window.ECSY.Types.Boolean, default: false },
    isMating: { type: window.ECSY.Types.Boolean, default: false },
    schoolingPreference: { type: window.ECSY.Types.Number, default: 0.8 },
    personalSpace: { type: window.ECSY.Types.Number, default: 1.0 },
    lastBreedTime: { type: window.ECSY.Types.Number, default: 0 },
    breedCooldown: { type: window.ECSY.Types.Number, default: 30000 },
    aggressionLevel: { type: window.ECSY.Types.Number, default: 0.0 },
    huntingRadius: { type: window.ECSY.Types.Number, default: 5.0 }
};
//# sourceMappingURL=Behavior.js.map