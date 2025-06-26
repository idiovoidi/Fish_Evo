/**
 * Behavior component for tracking entity's behavioral state
 */
export class Behavior extends window.ECSY.Component {}

Behavior.schema = {
  isHungry: { type: window.ECSY.Types.Boolean, default: false },
  isFleeing: { type: window.ECSY.Types.Boolean, default: false },
  isSchooling: { type: window.ECSY.Types.Boolean, default: false },
  isResting: { type: window.ECSY.Types.Boolean, default: false },
  isMating: { type: window.ECSY.Types.Boolean, default: false },
  schoolingPreference: { type: window.ECSY.Types.Number, default: 0.8 }, // Higher values prefer schooling
  personalSpace: { type: window.ECSY.Types.Number, default: 1.0 }, // Minimum preferred distance from others
  // Breeding
  lastBreedTime: { type: window.ECSY.Types.Number, default: 0 }, // timestamp ms
  breedCooldown: { type: window.ECSY.Types.Number, default: 30000 } // 30-second cooldown
}; 