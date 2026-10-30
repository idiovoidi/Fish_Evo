import { ECSY } from '../ecsy';
export class Health extends ECSY.Component {
  current: number = 100;
  max: number = 100;
  regenRate: number = 0;
  isDead: boolean = false;
  /** What killed it: 'starvation' | 'age' | 'predator' (empty while alive). */
  cause: string = '';
}

(Health as any).schema = {
  current: { type: ECSY.Types.Number, default: 100 },
  max: { type: ECSY.Types.Number, default: 100 },
  regenRate: { type: ECSY.Types.Number, default: 0 },
  isDead: { type: ECSY.Types.Boolean, default: false },
  cause: { type: ECSY.Types.String, default: '' }
};
