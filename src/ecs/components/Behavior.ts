export class Behavior extends (window as any).ECSY.Component {
  isHungry: boolean = false;
  isFleeing: boolean = false;
  isSchooling: boolean = false;
  isResting: boolean = false;
  isMating: boolean = false;
  schoolingPreference: number = 0.8;
  personalSpace: number = 1.0;
  lastBreedTime: number = 0;
  breedCooldown: number = 30000;
  aggressionLevel: number = 0.0;
  huntingRadius: number = 5.0;
}

(Behavior as any).schema = {
  isHungry: { type: (window as any).ECSY.Types.Boolean, default: false },
  isFleeing: { type: (window as any).ECSY.Types.Boolean, default: false },
  isSchooling: { type: (window as any).ECSY.Types.Boolean, default: false },
  isResting: { type: (window as any).ECSY.Types.Boolean, default: false },
  isMating: { type: (window as any).ECSY.Types.Boolean, default: false },
  schoolingPreference: { type: (window as any).ECSY.Types.Number, default: 0.8 },
  personalSpace: { type: (window as any).ECSY.Types.Number, default: 1.0 },
  lastBreedTime: { type: (window as any).ECSY.Types.Number, default: 0 },
  breedCooldown: { type: (window as any).ECSY.Types.Number, default: 30000 },
  aggressionLevel: { type: (window as any).ECSY.Types.Number, default: 0.0 },
  huntingRadius: { type: (window as any).ECSY.Types.Number, default: 5.0 }
};
