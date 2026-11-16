import { ECSY } from '../ecsy';
import { Position } from '../components/Position';
import { Velocity } from '../components/Velocity';
import { Behavior } from '../components/Behavior';
import { CrabTag, FoodTag } from '../components/Tags';
import { SimulationConfig } from '../../config/simulation_config';
import { terrainHeight } from '../../environment/terrain_height';

/** How far from a wall the soft push-back begins. */
const WALL_SOFT_ZONE = 9;
/** Clearance kept between swimmers and the seabed. */
const FLOOR_MARGIN = 1.2;
const FLEE_SPEED_BOOST = 1.4;

export class MovementSystem extends ECSY.System {
  bounds = SimulationConfig.world.bounds;

  execute(delta: number) {
    const dt = delta / 1000;

    this.queries.moving.results.forEach((entity: any) => {
      const position = entity.getMutableComponent(Position);
      const velocity = entity.getMutableComponent(Velocity);

      if (entity.hasComponent(CrabTag)) {
        this.moveCrab(position, velocity, dt);
        return;
      }
      if (entity.hasComponent(FoodTag)) {
        this.moveFood(position, velocity, dt);
        return;
      }

      this.steerAwayFromWalls(position, velocity, dt);
      this.steerOverTerrain(position, velocity, dt);

      position.x += velocity.x * dt;
      position.y += velocity.y * dt;
      position.z += velocity.z * dt;

      this.applyBoundaryConstraints(position, velocity);

      const behavior = entity.getComponent(Behavior);
      this.clampVelocity(velocity, behavior?.isFleeing ? FLEE_SPEED_BOOST : 1);
    });
  }

  /** Swimmers anticipate rising dunes and lift over them rather than scraping along. */
  private steerOverTerrain(p: any, v: any, dt: number) {
    // Low enough that swimmers can still reach pellets resting on the floor.
    const ahead = terrainHeight(p.x + v.x * 0.9, p.z + v.z * 0.9) + FLOOR_MARGIN + 0.4;
    if (p.y < ahead) v.y += (ahead - p.y) * 4 * dt;
  }

  private steerAwayFromWalls(p: any, v: any, dt: number) {
    const b = this.bounds;
    const push = (dist: number) => Math.pow(Math.min(1, Math.max(0, dist / WALL_SOFT_ZONE)), 2) * 9 * dt;
    v.x += push(p.x - (b.maxX - WALL_SOFT_ZONE)) * -1 + push((b.minX + WALL_SOFT_ZONE) - p.x);
    v.z += push(p.z - (b.maxZ - WALL_SOFT_ZONE)) * -1 + push((b.minZ + WALL_SOFT_ZONE) - p.z);
    v.y += push(p.y - (b.maxY - 4)) * -0.8;
  }

  private moveCrab(p: any, v: any, dt: number) {
    const b = this.bounds;
    p.x = Math.max(b.minX + 2, Math.min(b.maxX - 2, p.x + v.x * dt));
    p.z = Math.max(b.minZ + 2, Math.min(b.maxZ - 2, p.z + v.z * dt));
    p.y = terrainHeight(p.x, p.z) + SimulationConfig.entities.crabs.spawnHeight;
    v.y = 0;
  }

  /** Pellets sink, then settle on whatever the floor is under them. */
  private moveFood(p: any, v: any, dt: number) {
    const floor = terrainHeight(p.x, p.z) + 0.22;
    if (p.y <= floor) {
      p.y = floor;
      v.x = v.y = v.z = 0;
      return;
    }
    p.x += v.x * dt;
    p.y = Math.max(floor, p.y + v.y * dt);
    p.z += v.z * dt;
    v.x += (Math.random() - 0.5) * 0.6 * dt;
    v.z += (Math.random() - 0.5) * 0.6 * dt;
  }

  applyBoundaryConstraints(position: any, velocity: any) {
    const b = this.bounds;
    const dampening = 0.7;
    const margin = 1;

    if (position.x <= b.minX + margin) {
      position.x = b.minX + margin;
      if (velocity.x < 0) velocity.x = Math.abs(velocity.x) * dampening;
    } else if (position.x >= b.maxX - margin) {
      position.x = b.maxX - margin;
      if (velocity.x > 0) velocity.x = -Math.abs(velocity.x) * dampening;
    }

    const floor = terrainHeight(position.x, position.z) + FLOOR_MARGIN;
    if (position.y <= floor) {
      position.y = floor;
      if (velocity.y < 0) velocity.y = Math.abs(velocity.y) * dampening;
    } else if (position.y >= b.maxY - margin) {
      position.y = b.maxY - margin;
      if (velocity.y > 0) velocity.y = -Math.abs(velocity.y) * dampening;
    }

    if (position.z <= b.minZ + margin) {
      position.z = b.minZ + margin;
      if (velocity.z < 0) velocity.z = Math.abs(velocity.z) * dampening;
    } else if (position.z >= b.maxZ - margin) {
      position.z = b.maxZ - margin;
      if (velocity.z > 0) velocity.z = -Math.abs(velocity.z) * dampening;
    }
  }

  clampVelocity(velocity: any, multiplier = 1) {
    const max = velocity.maxSpeed * multiplier;
    const speedSq = velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z;
    if (speedSq > max * max) {
      const scale = max / Math.sqrt(speedSq);
      velocity.x *= scale;
      velocity.y *= scale;
      velocity.z *= scale;
    }
  }
}

(MovementSystem as any).queries = {
  moving: { components: [Position, Velocity] }
};
