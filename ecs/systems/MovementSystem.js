import { Position } from '../components/Position.js';
import { Velocity } from '../components/Velocity.js';

/**
 * Movement System - Updates entity positions based on velocity with improved boundary handling
 */
export class MovementSystem extends window.ECSY.System {
  init() {
    const cfg = (typeof window !== 'undefined' && window.SimulationConfig) ? window.SimulationConfig : null;
    const b = cfg?.world?.bounds;
    this.bounds = b || { minX: -50, maxX: 50, minY: 0, maxY: 30, minZ: -50, maxZ: 50 };
  }

  execute(delta, time) {
    // Convert delta to seconds for consistent movement speed
    const deltaTime = delta / 1000;
    
    // Query entities with both Position and Velocity components
    this.queries.moving.results.forEach(entity => {
      const position = entity.getMutableComponent(Position);  // Need mutable for updates
      const velocity = entity.getMutableComponent(Velocity);  // Need mutable for boundary reactions
      
      // Apply velocity to position
      position.x += velocity.x * deltaTime;
      position.y += velocity.y * deltaTime;
      position.z += velocity.z * deltaTime;
      
      // Apply boundary constraints with bounce-back effect
      this.applyBoundaryConstraints(position, velocity);
      
      // Ensure velocity stays within reasonable bounds
      this.clampVelocity(velocity);
    });
  }
  
  // Improved boundary constraint with velocity reflection
  applyBoundaryConstraints(position, velocity) {
    const b = this.bounds;
    if (!b) return;
    
    const dampening = 0.7; // Reduce speed when bouncing
    const margin = 1; // Small margin to prevent sticking
    
    // X boundaries
    if (position.x <= b.minX + margin) {
      position.x = b.minX + margin;
      if (velocity.x < 0) velocity.x = Math.abs(velocity.x) * dampening;
    } else if (position.x >= b.maxX - margin) {
      position.x = b.maxX - margin;
      if (velocity.x > 0) velocity.x = -Math.abs(velocity.x) * dampening;
    }
    
    // Y boundaries (vertical)
    if (position.y <= b.minY + margin) {
      position.y = b.minY + margin;
      if (velocity.y < 0) velocity.y = Math.abs(velocity.y) * dampening;
    } else if (position.y >= b.maxY - margin) {
      position.y = b.maxY - margin;
      if (velocity.y > 0) velocity.y = -Math.abs(velocity.y) * dampening;
    }
    
    // Z boundaries  
    if (position.z <= b.minZ + margin) {
      position.z = b.minZ + margin;
      if (velocity.z < 0) velocity.z = Math.abs(velocity.z) * dampening;
    } else if (position.z >= b.maxZ - margin) {
      position.z = b.maxZ - margin;
      if (velocity.z > 0) velocity.z = -Math.abs(velocity.z) * dampening;
    }
  }
  
  // Consistent velocity clamping
  clampVelocity(velocity) {
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

// Define queries - which entities this system should process
MovementSystem.queries = {
  moving: { components: [Position, Velocity] }
}; 