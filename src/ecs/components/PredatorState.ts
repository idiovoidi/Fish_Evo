import { ECSY } from '../ecsy';
export class PredatorState extends ECSY.Component {
  lastBiteTime: number = 0;
  biteCooldown: number = 2000;
  huntingTarget: any = null;
  chaseSpeed: number = 10;
  lastAttackTime: number = 0;
  isChasing: boolean = false;
  /** Sim time (ms) until which the shark is full and ignores prey. */
  satiatedUntil: number = 0;
}

(PredatorState as any).schema = {
  lastBiteTime: { type: ECSY.Types.Number, default: 0 },
  biteCooldown: { type: ECSY.Types.Number, default: 2000 },
  huntingTarget: { type: ECSY.Types.Ref, default: null },
  chaseSpeed: { type: ECSY.Types.Number, default: 10 },
  lastAttackTime: { type: ECSY.Types.Number, default: 0 },
  isChasing: { type: ECSY.Types.Boolean, default: false },
  satiatedUntil: { type: ECSY.Types.Number, default: 0 }
};
