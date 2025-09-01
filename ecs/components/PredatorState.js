/**
 * PredatorState component – stores hunting and predator behavior state
 */
export class PredatorState extends window.ECSY.Component {}

PredatorState.schema = {
  lastBiteTime: { type: window.ECSY.Types.Number, default: 0 },
  biteCooldown: { type: window.ECSY.Types.Number, default: 2000 },
  huntingTarget: { type: window.ECSY.Types.Ref, default: null }, // Reference to current prey entity
  chaseSpeed: { type: window.ECSY.Types.Number, default: 10 }, // Speed when actively chasing
  lastAttackTime: { type: window.ECSY.Types.Number, default: 0 }, // Timestamp of last attack
  isChasing: { type: window.ECSY.Types.Boolean, default: false } // Currently in chase mode
}; 