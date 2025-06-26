/**
 * PredatorState component – stores cooldown timers specific to predators (sharks)
 */
export class PredatorState extends window.ECSY.Component {}

PredatorState.schema = {
  lastBiteTime: { type: window.ECSY.Types.Number, default: 0 },
  biteCooldown: { type: window.ECSY.Types.Number, default: 2000 }
}; 