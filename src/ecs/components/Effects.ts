import { ECSY } from '../ecsy';

/**
 * Short-lived visual state. Gameplay systems poke the values (e.g. `pulse = 1`
 * when a fish eats); RenderSystem decays them and applies them to the mesh.
 */
export class Effects extends ECSY.Component {
  /** 1 → 0: a quick "gulp" scale pulse. */
  pulse: number = 0;
  /** 1 → 0: warm shader flash (eating, mating). */
  flash: number = 0;
  /** 0 → 1: progress of the death animation. */
  dying: number = 0;
}

(Effects as any).schema = {
  pulse: { type: ECSY.Types.Number, default: 0 },
  flash: { type: ECSY.Types.Number, default: 0 },
  dying: { type: ECSY.Types.Number, default: 0 }
};
