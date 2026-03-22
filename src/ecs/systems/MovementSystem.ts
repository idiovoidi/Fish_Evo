import { Position } from '../components/Position';
import { Velocity } from '../components/Velocity';

interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

export class MovementSystem extends (window as any).ECSY.System {
  bounds: Bounds = { minX: -50, maxX: 50, minY: 0, maxY: 30, minZ: -50, maxZ: 50 };

  init() {
    const cfg = (typeof window !== 'undefined' && (window as any).SimulationConfig) ? (window as any).SimulationConfig : null;
    const b = cfg?.world?.bounds;
    this.bounds = b || { minX: -50, maxX: 50, minY: 0, maxY: 30, minZ: -50, maxZ: 50 };
  }

  execute(delta: number, _time: number) {
    const deltaTime = delta / 1000;
    
    this.queries.moving.results.forEach((entity: any) => {
      const position = entity.getMutableComponent(Position);
      const velocity = entity.getMutableComponent(Velocity);
      
      position.x += velocity.x * deltaTime;
      position.y += velocity.y * deltaTime;
      position.z += velocity.z * deltaTime;
      
      this.applyBoundaryConstraints(position, velocity);
      this.clampVelocity(velocity);
    });
  }
  
  applyBoundaryConstraints(position: any, velocity: any) {
    const b = this.bounds;
    if (!b) return;
    
    const dampening = 0.7;
    const margin = 1;
    
    if (position.x <= b.minX + margin) {
      position.x = b.minX + margin;
      if (velocity.x < 0) velocity.x = Math.abs(velocity.x) * dampening;
    } else if (position.x >= b.maxX - margin) {
      position.x = b.maxX - margin;
      if (velocity.x > 0) velocity.x = -Math.abs(velocity.x) * dampening;
    }
    
    if (position.y <= b.minY + margin) {
      position.y = b.minY + margin;
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
  
  clampVelocity(velocity: any) {
    const speedSq = velocity.x*velocity.x + velocity.y*velocity.y + velocity.z*velocity.z;
    const maxSq = velocity.maxSpeed * velocity.maxSpeed;
    
    if (speedSq > maxSq) {
      const scale = velocity.maxSpeed / Math.sqrt(speedSq);
      velocity.x *= scale;
      velocity.y *= scale;
      velocity.z *= scale;
    }
  }
}

(MovementSystem as any).queries = {
  moving: { components: [Position, Velocity] }
};
