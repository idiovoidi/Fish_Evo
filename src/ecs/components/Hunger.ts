import { ECSY } from '../ecsy';
export class Hunger extends ECSY.Component {
  value: number = 0;
  rate: number = 0.01;
  lastFed: number = 0;
}

(Hunger as any).schema = {
  value: { type: ECSY.Types.Number, default: 0 },
  rate: { type: ECSY.Types.Number, default: 0.01 },
  lastFed: { type: ECSY.Types.Number, default: 0 }
};
