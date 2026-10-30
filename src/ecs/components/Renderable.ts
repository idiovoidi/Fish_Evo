import { ECSY } from '../ecsy';
export class Renderable extends ECSY.Component {
  model: any = null;
  scale: number = 1;
  visible: boolean = true;
}

(Renderable as any).schema = {
  model: { type: ECSY.Types.Ref, default: null },
  scale: { type: ECSY.Types.Number, default: 1 },
  visible: { type: ECSY.Types.Boolean, default: true }
};
