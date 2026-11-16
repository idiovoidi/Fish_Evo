import { ECSY } from '../ecsy';
export class Genetics extends ECSY.Component {
  size: number = 1;
  speed: number = 5;
  metabolism: number = 1;
  color: number[] = [100, 180, 255];
  /** 0 for the original stock, parents' max + 1 for offspring. */
  generation: number = 0;
}

(Genetics as any).serializable = true;

(Genetics as any).schema = {
  size: { type: ECSY.Types.Number, default: 1 },
  speed: { type: ECSY.Types.Number, default: 5 },
  metabolism: { type: ECSY.Types.Number, default: 1 },
  color: { type: ECSY.Types.Ref, default: [100, 180, 255] },
  generation: { type: ECSY.Types.Number, default: 0 }
};
