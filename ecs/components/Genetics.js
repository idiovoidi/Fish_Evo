/**
 * Genetics component – stores heritable traits for evolutionary simulation
 */
export class Genetics extends window.ECSY.Component {}

// Mark component as serializable for save-state system
Genetics.serializable = true;

Genetics.schema = {
  // Physical size multiplier (0.5 – 2.0)
  size: { type: window.ECSY.Types.Number, default: 1 },
  // Maximum swim speed (2 – 10)
  speed: { type: window.ECSY.Types.Number, default: 5 },
  // Metabolism multiplier for energy decay (0.5 – 1.5)
  metabolism: { type: window.ECSY.Types.Number, default: 1 },
  // RGB color array – integers 0-255
  color: { type: window.ECSY.Types.Ref, default: [100, 180, 255] }
}; 