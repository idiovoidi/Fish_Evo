/**
 * Renderable component for entities that need visual representation
 */
export class Renderable extends window.ECSY.Component {}

Renderable.schema = {
  model: { type: window.ECSY.Types.Ref, default: null }, // Reference to Babylon.js mesh or other visual object
  scale: { type: window.ECSY.Types.Number, default: 1 },
  visible: { type: window.ECSY.Types.Boolean, default: true },
  // Color could be added if needed
}; 