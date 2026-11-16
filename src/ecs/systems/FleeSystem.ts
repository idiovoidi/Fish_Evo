import { ECSY } from '../ecsy';
import { Position } from '../components/Position';
import { Velocity } from '../components/Velocity';
import { Behavior } from '../components/Behavior';
import { Health } from '../components/Health';
import { PredatorState } from '../components/PredatorState';
import { FishTag, SharkTag } from '../components/Tags';
import { SpatialHashSystem } from './SpatialHashSystem';
import { clampVelocity } from '../../utils/velocity';

const ALARM_RADIUS = 18;
const FLEE_ACCEL = 34;
const FLEE_SPEED_BOOST = 1.4;

/** Fish bolt away from nearby sharks; a well-fed shark alarms them less. */
export class FleeSystem extends ECSY.System {
  spatial: any;

  init() {
    this.spatial = this.world.getSystem(SpatialHashSystem);
  }

  execute(delta: number, time: number) {
    const dt = delta / 1000;

    this.queries.fish.results.forEach((fish: any) => {
      const behavior = fish.getMutableComponent(Behavior);
      const health = fish.getComponent(Health);
      if (health?.isDead) return;

      const pos = fish.getComponent(Position);
      const sharks = this.spatial.getEntitiesNear(pos, ALARM_RADIUS, SharkTag);
      if (sharks.length === 0) {
        behavior.isFleeing = false;
        return;
      }

      let ax = 0, ay = 0, az = 0;
      for (const shark of sharks) {
        const sp = shark.getComponent(Position);
        const state = shark.getComponent(PredatorState);
        const calm = state && time < state.satiatedUntil ? 0.35 : 1;
        const dx = pos.x - sp.x, dy = pos.y - sp.y, dz = pos.z - sp.z;
        const d = Math.hypot(dx, dy, dz) || 1;
        const urgency = Math.pow(1 - d / ALARM_RADIUS, 2) * calm;
        ax += (dx / d) * urgency;
        ay += (dy / d) * urgency * 0.5;
        az += (dz / d) * urgency;
      }

      behavior.isFleeing = true;
      const vel = fish.getMutableComponent(Velocity);
      vel.x += ax * FLEE_ACCEL * dt;
      vel.y += ay * FLEE_ACCEL * dt;
      vel.z += az * FLEE_ACCEL * dt;
      clampVelocity(vel, { maxSpeedMultiplier: FLEE_SPEED_BOOST });
    });
  }
}

(FleeSystem as any).queries = {
  fish: { components: [FishTag, Position, Velocity, Behavior] }
};
