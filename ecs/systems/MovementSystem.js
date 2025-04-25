import { Position } from '../components/Position.js';
import { Velocity } from '../components/Velocity.js';

/**
 * Movement System - Updates entity positions based on velocity
 */
export class MovementSystem extends window.ECSY.System {
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
    // Default boundaries - can be made configurable later
    const bounds = {
      minX: -50, maxX: 50,
      minY: 0, maxY: 30,
      minZ: -50, maxZ: 50
    };
    
    // Apply constraints with a bounce effect
    if (position.x < bounds.minX) position.x = bounds.minX;
    if (position.x > bounds.maxX) position.x = bounds.maxX;
    if (position.y < bounds.minY) position.y = bounds.minY;
    if (position.y > bounds.maxY) position.y = bounds.maxY;
    if (position.z < bounds.minZ) position.z = bounds.minZ;
    if (position.z > bounds.maxZ) position.z = bounds.maxZ;
  }
}

// Define queries - which entities this system should process
MovementSystem.queries = {
  moving: { components: [Position, Velocity] }
}; 