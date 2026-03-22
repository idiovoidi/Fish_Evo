export class Renderable extends (window as any).ECSY.Component {
  model: any = null;
  scale: number = 1;
  visible: boolean = true;
}

(Renderable as any).schema = {
  model: { type: (window as any).ECSY.Types.Ref, default: null },
  scale: { type: (window as any).ECSY.Types.Number, default: 1 },
  visible: { type: (window as any).ECSY.Types.Boolean, default: true }
};
