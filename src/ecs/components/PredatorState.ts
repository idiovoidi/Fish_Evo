export class PredatorState extends (window as any).ECSY.Component {
  lastBiteTime: number = 0;
  biteCooldown: number = 2000;
  huntingTarget: any = null;
  chaseSpeed: number = 10;
  lastAttackTime: number = 0;
  isChasing: boolean = false;
}

(PredatorState as any).schema = {
  lastBiteTime: { type: (window as any).ECSY.Types.Number, default: 0 },
  biteCooldown: { type: (window as any).ECSY.Types.Number, default: 2000 },
  huntingTarget: { type: (window as any).ECSY.Types.Ref, default: null },
  chaseSpeed: { type: (window as any).ECSY.Types.Number, default: 10 },
  lastAttackTime: { type: (window as any).ECSY.Types.Number, default: 0 },
  isChasing: { type: (window as any).ECSY.Types.Boolean, default: false }
};
