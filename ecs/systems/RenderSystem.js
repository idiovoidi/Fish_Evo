import { Position } from '../components/Position.js';
import { Velocity } from '../components/Velocity.js';
import { Renderable } from '../components/Renderable.js';
import { FishTag, SharkTag } from '../components/Tags.js';

/**
 * Render System - Updates the visual representation and orientation of entities
 */
export class RenderSystem extends window.ECSY.System {
  execute(delta, time) {
    // Process all entities with Position and Renderable components
    this.queries.renderables.results.forEach(entity => {
      const position = entity.getComponent(Position);
      const renderable = entity.getComponent(Renderable);
      
      // Skip if model not available yet or not visible
      if (!renderable.model || !renderable.visible) return;
      
      try {
        // Update mesh position to match entity position
        renderable.model.position.x = position.x;
        renderable.model.position.y = position.y;
        renderable.model.position.z = position.z;
        
        // Update orientation for moving entities (fish and sharks)
        if (entity.hasComponent(Velocity) && (entity.hasComponent(FishTag) || entity.hasComponent(SharkTag))) {
          this.updateEntityOrientation(entity, renderable);
        }
        
      } catch (err) {
        console.warn('Error updating renderable:', err);
      }
    });
  }
  
  /**
   * Update entity orientation based on movement direction
   */
  updateEntityOrientation(entity, renderable) {
    const velocity = entity.getComponent(Velocity);
    
    // Only update orientation if entity is moving
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z);
    if (speed < 0.1) return; // Too slow to determine direction
    
    // Calculate the direction the entity should face
    const direction = {
      x: velocity.x / speed,
      y: velocity.y / speed,
      z: velocity.z / speed
    };
    
    // Calculate rotation angles
    // Yaw (horizontal rotation) - rotation around Y axis
    const yaw = Math.atan2(-direction.x, -direction.z);
    
    // Pitch (vertical tilt) - rotation around X axis (reduced for natural swimming)
    const pitch = Math.asin(direction.y) * 0.3; // Reduce vertical tilt for more natural look
    
    // Apply rotation to the model
    if (renderable.model.rotation) {
      // Smooth rotation interpolation for natural movement
      const lerpFactor = 0.1; // How quickly to turn (0.1 = gradual, 1.0 = instant)
      
      // Handle angle wrapping for smooth interpolation
      let targetYaw = yaw;
      let currentYaw = renderable.model.rotation.y;
      
      // Find the shortest rotation path
      let angleDiff = targetYaw - currentYaw;
      if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
      if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
      
      // Smoothly interpolate to new rotation
      renderable.model.rotation.y += angleDiff * lerpFactor;
      renderable.model.rotation.x += (pitch - renderable.model.rotation.x) * lerpFactor;
      
      // Add subtle banking effect for fish (roll when turning)
      if (entity.hasComponent(FishTag)) {
        const bankingAmount = Math.sin(angleDiff) * 0.2; // Banking when turning
        renderable.model.rotation.z += (bankingAmount - renderable.model.rotation.z) * lerpFactor;
      }
    }
  }
}

// Define queries - which entities this system should process
RenderSystem.queries = {
  renderables: { components: [Position, Renderable] }
}; 