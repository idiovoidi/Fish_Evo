import { Position } from '../components/Position.js';
import { Renderable } from '../components/Renderable.js';

/**
 * Render System - Updates the visual representation of entities
 */
export class RenderSystem extends window.ECSY.System {
  execute(delta, time) {
    // Process all entities with both Position and Renderable components
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
        
        // Additional visual updates could go here (rotation, animation, etc.)
      } catch (err) {
        console.warn('Error updating renderable:', err);
      }
    });
  }
}

// Define queries - which entities this system should process
RenderSystem.queries = {
  renderables: { components: [Position, Renderable] }
}; 