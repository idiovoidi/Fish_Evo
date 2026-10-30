import { ECSY } from '../ecsy';
export class Age extends ECSY.Component {
  value: number = 0;
  maturityAge: number = 60;
  maxAge: number = 300;
  isAdult: boolean = false;
}

(Age as any).schema = {
  value: { type: ECSY.Types.Number, default: 0 },
  maturityAge: { type: ECSY.Types.Number, default: 60 },
  maxAge: { type: ECSY.Types.Number, default: 300 },
  isAdult: { type: ECSY.Types.Boolean, default: false }
};
