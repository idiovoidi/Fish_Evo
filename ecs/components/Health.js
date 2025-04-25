/**
 * Health component for tracking entity health status
 */
export class Health extends window.ECSY.Component {}

Health.schema = {
  current: { type: window.ECSY.Types.Number, default: 100 },
  max: { type: window.ECSY.Types.Number, default: 100 },
  regenRate: { type: window.ECSY.Types.Number, default: 0 }, // Health regeneration per second
  isDead: { type: window.ECSY.Types.Boolean, default: false }
}; 