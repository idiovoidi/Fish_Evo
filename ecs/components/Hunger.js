/**
 * Hunger component for tracking entity hunger levels and food needs
 */
export class Hunger extends window.ECSY.Component {}

Hunger.schema = {
  value: { type: window.ECSY.Types.Number, default: 0 }, // 0 = full, 1 = starving
  rate: { type: window.ECSY.Types.Number, default: 0.01 }, // How quickly hunger increases
  lastFed: { type: window.ECSY.Types.Number, default: 0 } // Time when last ate
}; 