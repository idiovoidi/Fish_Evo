import { ECSY } from '../ecsy';
export class Behavior extends ECSY.Component {
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
  /** Crabs: seconds left in the current rest, and how long the next one lasts. */
  waitTime: number = 0;
  waitDuration: number = 3;
  lastStateChange: number = 0;
}

(Behavior as any).schema = {
  isHungry: { type: ECSY.Types.Boolean, default: false },
  isFleeing: { type: ECSY.Types.Boolean, default: false },
  isSchooling: { type: ECSY.Types.Boolean, default: false },
  isResting: { type: ECSY.Types.Boolean, default: false },
  isMating: { type: ECSY.Types.Boolean, default: false },
  schoolingPreference: { type: ECSY.Types.Number, default: 0.8 },
  personalSpace: { type: ECSY.Types.Number, default: 1.0 },
  lastBreedTime: { type: ECSY.Types.Number, default: 0 },
  breedCooldown: { type: ECSY.Types.Number, default: 30000 },
  aggressionLevel: { type: ECSY.Types.Number, default: 0.0 },
  huntingRadius: { type: ECSY.Types.Number, default: 5.0 },
  waitTime: { type: ECSY.Types.Number, default: 0 },
  waitDuration: { type: ECSY.Types.Number, default: 3 },
  lastStateChange: { type: ECSY.Types.Number, default: 0 }
};
