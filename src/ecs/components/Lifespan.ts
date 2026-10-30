import { ECSY } from '../ecsy';

/** Simple expiry timer (seconds), used by food pellets. */
export class Lifespan extends ECSY.Component {
  age: number = 0;
  max: number = 60;
}

(Lifespan as any).schema = {
  age: { type: ECSY.Types.Number, default: 0 },
  max: { type: ECSY.Types.Number, default: 60 }
};
