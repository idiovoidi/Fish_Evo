import { Position } from '../components/Position.js';
import { Velocity } from '../components/Velocity.js';
import { Behavior } from '../components/Behavior.js';
import { FishTag } from '../components/Tags.js';
import { SpatialHashSystem } from './SpatialHashSystem.js';

// Simple schooling system (boids-lite): cohesion + separation
export class SchoolingSystem extends window.ECSY.System {
  init() {
    this.spatial = this.world.getSystem(SpatialHashSystem);
    this.neighborRadius = 6;
    this.separationDistance = 1.2;
  }

  execute(delta) {
    const dt = (delta || 0) / 1000;
    const r = this.neighborRadius;
    const rSep = this.separationDistance;
    this.queries.fish.results.forEach(entity => {
      const pos = entity.getComponent(Position);
      const vel = entity.getMutableComponent(Velocity);
      const beh = entity.getComponent(Behavior);
      if (!pos || !vel) return;

      const neighbors = this.spatial.getEntitiesNear(pos, r, FishTag);
      if (!neighbors || neighbors.length === 0) return;

      let count = 0;
      const center = { x:0, y:0, z:0 };
      const sep = { x:0, y:0, z:0 };
      neighbors.forEach(n => {
        if (n === entity) return;
        const p = n.getComponent(Position);
        if (!p) return;
        center.x += p.x; center.y += p.y; center.z += p.z; count++;
        const dx = pos.x - p.x, dy = pos.y - p.y, dz = pos.z - p.z;
        const d2 = dx*dx+dy*dy+dz*dz;
        if (d2 > 0 && d2 < rSep*rSep) {
          const inv = 1/Math.sqrt(d2);
          sep.x += dx*inv; sep.y += dy*inv; sep.z += dz*inv;
        }
      });
      if (count === 0) return;
      center.x/=count; center.y/=count; center.z/=count;

      // Cohesion: steer toward center
      const steerC = { x: center.x - pos.x, y: center.y - pos.y, z: center.z - pos.z };
      // Separation already points away from close neighbors

      const pref = beh?.schoolingPreference ?? 1.0;
      const weightCohesion = 0.8 * pref;
      const weightSeparation = 1.2 * (2 - pref);

      vel.x += (steerC.x * weightCohesion + sep.x * weightSeparation) * dt;
      vel.y += (steerC.y * weightCohesion + sep.y * weightSeparation) * dt * 0.2;
      vel.z += (steerC.z * weightCohesion + sep.z * weightSeparation) * dt;

      // Clamp speed to maxSpeed
      const speedSq = vel.x*vel.x + vel.y*vel.y + vel.z*vel.z;
      const maxSq = vel.maxSpeed * vel.maxSpeed;
      if (speedSq > maxSq) {
        const s = vel.maxSpeed / Math.sqrt(speedSq);
        vel.x *= s; vel.y *= s; vel.z *= s;
      }
    });
  }
}

SchoolingSystem.queries = { fish: { components: [FishTag, Position, Velocity] } };




