/**
 * Age component for tracking entity age and maturity
 */
export class Age extends window.ECSY.Component {}

Age.schema = {
  value: { type: window.ECSY.Types.Number, default: 0 }, // Current age in seconds
  maturityAge: { type: window.ECSY.Types.Number, default: 60 }, // Age in seconds when entity reaches maturity
  maxAge: { type: window.ECSY.Types.Number, default: 300 }, // Maximum age in seconds
  isAdult: { type: window.ECSY.Types.Boolean, default: false }
}; 