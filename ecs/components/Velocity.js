/**
 * Velocity component for storing entity velocity vectors
 */
export class Velocity extends window.ECSY.Component {}

Velocity.schema = {
  x: { type: window.ECSY.Types.Number, default: 0 },
  y: { type: window.ECSY.Types.Number, default: 0 },
  z: { type: window.ECSY.Types.Number, default: 0 },
  maxSpeed: { type: window.ECSY.Types.Number, default: 5 }
}; 