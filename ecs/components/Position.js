/**
 * Position component for storing entity position in 3D space
 */
export class Position extends window.ECSY.Component {}

Position.schema = {
  x: { type: window.ECSY.Types.Number, default: 0 },
  y: { type: window.ECSY.Types.Number, default: 0 },
  z: { type: window.ECSY.Types.Number, default: 0 }
}; 