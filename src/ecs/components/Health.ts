export class Health extends (window as any).ECSY.Component {
  current: number = 100;
  max: number = 100;
  regenRate: number = 0;
  isDead: boolean = false;
}

(Health as any).schema = {
  current: { type: (window as any).ECSY.Types.Number, default: 100 },
  max: { type: (window as any).ECSY.Types.Number, default: 100 },
  regenRate: { type: (window as any).ECSY.Types.Number, default: 0 },
  isDead: { type: (window as any).ECSY.Types.Boolean, default: false }
};
