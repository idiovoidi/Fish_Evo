import { ECSY } from '../ecsy';
export class Position extends ECSY.Component {
  x: number = 0;
  y: number = 0;
  z: number = 0;
}

(Position as any).schema = {
  x: { type: ECSY.Types.Number, default: 0 },
  y: { type: ECSY.Types.Number, default: 0 },
  z: { type: ECSY.Types.Number, default: 0 }
};
