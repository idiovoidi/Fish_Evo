import { ECSY } from '../ecsy';
import { Position } from '../components/Position';
import { Velocity } from '../components/Velocity';
import { Renderable } from '../components/Renderable';
import { Hunger } from '../components/Hunger';
import { Effects } from '../components/Effects';
import { CrabTag, FishTag, SharkTag } from '../components/Tags';
import { setCreatureState } from '../../render/model_library';

const TAU = Math.PI * 2;

function wrapAngle(a: number) {
  while (a > Math.PI) a -= TAU;
  while (a < -Math.PI) a += TAU;
  return a;
}

/** Copies simulation state onto the Babylon instances. Models face +Z. */
export class RenderSystem extends ECSY.System {
  execute(delta: number, time: number) {
    const dt = Math.min(0.1, delta / 1000);
    const follow = 1 - Math.exp(-dt * 7);

    this.queries.renderables.results.forEach((entity: any) => {
      const renderable = entity.getComponent(Renderable);
      const model = renderable.model;
      if (!model) return;
      model.setEnabled(renderable.visible);
      if (!renderable.visible) return;

      const position = entity.getComponent(Position);
      model.position.set(position.x, position.y, position.z);

      const isFish = entity.hasComponent(FishTag);
      const isShark = entity.hasComponent(SharkTag);
      const velocity = entity.getComponent(Velocity);
      const fx = entity.getComponent(Effects);

      let scale = renderable.scale;
      let dyingRoll = 0;

      if (fx) {
        const mutable = entity.getMutableComponent(Effects);
        mutable.pulse = Math.max(0, mutable.pulse - dt * 2.2);
        mutable.flash = Math.max(0, mutable.flash - dt * 1.1);
        if (mutable.pulse > 0) scale *= 1 + 0.22 * Math.sin((1 - mutable.pulse) * Math.PI);
        if (mutable.dying > 0) {
          dyingRoll = Math.min(1, mutable.dying * 2.5) * Math.PI * 0.92;
          scale *= 1 - Math.max(0, mutable.dying - 0.7) / 0.3 * 0.9;
        }
      }
      model.scaling.setAll(Math.max(0.001, scale));

      if (velocity && (isFish || isShark)) {
        this.orient(model, velocity, follow, dyingRoll, fx ? fx.dying > 0 : false);
      } else if (velocity && entity.hasComponent(CrabTag)) {
        this.orientCrab(model, velocity, follow, time / 1000, renderable.scale);
      }

      if (isFish) {
        const hunger = entity.getComponent(Hunger);
        setCreatureState(model, {
          hunger: hunger ? hunger.value : 0,
          flash: fx ? fx.flash : 0,
          vitality: fx ? 1 - fx.dying * 0.9 : 1
        });
      } else if (isShark && fx) {
        setCreatureState(model, { flash: fx.flash, vitality: 1 - fx.dying * 0.9 });
      }
    });
  }

  private orient(model: any, v: any, follow: number, dyingRoll: number, dying: boolean) {
    const speed = Math.hypot(v.x, v.y, v.z);
    if (dying) {
      model.rotation.z += (dyingRoll - model.rotation.z) * follow;
      model.rotation.x += (0 - model.rotation.x) * follow;
      return;
    }
    if (speed < 0.1) return;

    const yaw = Math.atan2(v.x, v.z);
    const pitch = -Math.asin(Math.max(-1, Math.min(1, v.y / speed))) * 0.7;
    const diff = wrapAngle(yaw - model.rotation.y);

    model.rotation.y += diff * follow;
    model.rotation.x += (pitch - model.rotation.x) * follow;
    // Bank into the turn.
    const bank = Math.max(-0.55, Math.min(0.55, -diff * 1.2));
    model.rotation.z += (bank - model.rotation.z) * follow;
  }

  /** Crabs scuttle sideways: their long axis sits across the direction of travel. */
  private orientCrab(model: any, v: any, follow: number, t: number, scale: number) {
    const speed = Math.hypot(v.x, v.z);
    if (speed > 0.05) {
      const yaw = Math.atan2(v.x, v.z) + Math.PI / 2;
      model.rotation.y += wrapAngle(yaw - model.rotation.y) * follow * 0.6;
      model.rotation.z = Math.sin(t * 14 + model.position.x) * 0.04 * Math.min(1, speed);
    }
    model.scaling.setAll(scale);
  }
}

(RenderSystem as any).queries = {
  renderables: { components: [Position, Renderable] }
};
