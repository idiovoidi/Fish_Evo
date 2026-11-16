import { ECSY } from '../ecsy';
export class Velocity extends ECSY.Component {
  x: number = 0;
  y: number = 0;
  z: number = 0;
  maxSpeed: number = 5;
}

(Velocity as any).schema = {
  x: { type: ECSY.Types.Number, default: 0 },
  y: { type: ECSY.Types.Number, default: 0 },
  z: { type: ECSY.Types.Number, default: 0 },
  maxSpeed: { type: ECSY.Types.Number, default: 5 }
};
