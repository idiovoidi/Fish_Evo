import { Position } from '../components/Position.js';
import { Velocity } from '../components/Velocity.js';

/**
 * Movement System - Updates entity positions based on velocity
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
      const position = entity.getComponent(Position);
      const velocity = entity.getComponent(Velocity);
      
      // Update position based on velocity
      position.x += velocity.x * deltaTime;
      position.y += velocity.y * deltaTime;
      position.z += velocity.z * deltaTime;
      
      // Automatically apply simple boundary constraints if needed
      this.applyBoundaryConstraints(position);
    });
  }
  
  // Simple boundary constraint to keep entities within a bounding box
  applyBoundaryConstraints(position) {
    const b = this.bounds;
    if (!b) return;
    if (position.x < b.minX) position.x = b.minX;
    if (position.x > b.maxX) position.x = b.maxX;
    if (position.y < b.minY) position.y = b.minY;
    if (position.y > b.maxY) position.y = b.maxY;
    if (position.z < b.minZ) position.z = b.minZ;
    if (position.z > b.maxZ) position.z = b.maxZ;
  }
}

// Define queries - which entities this system should process
MovementSystem.queries = {
  moving: { components: [Position, Velocity] }
}; 