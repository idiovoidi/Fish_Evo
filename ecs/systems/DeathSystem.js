import { Health } from '../components/Health.js';
import { Renderable } from '../components/Renderable.js';
import { Velocity } from '../components/Velocity.js';

/**
 * Death System - Handles entity death, cleanup, and visual effects
 */
export class DeathSystem extends window.ECSY.System {
  init() {
    this.deathAnimations = new Map();
    this.DEATH_ANIMATION_DURATION = 2000; // 2 seconds to fade out
  }

  execute(delta, time) {
    const deltaTime = delta / 1000;
    
    // Find newly dead entities
    this.queries.dead.results.forEach(entity => {
      const health = entity.getComponent(Health);
      
      if (health.isDead && !this.deathAnimations.has(entity)) {
        // Start death animation
        this.startDeathAnimation(entity, time);
        console.log(`Entity ${entity.id} has died`);
      }
    });
    
    // Update death animations
    this.updateDeathAnimations(time);
  }
  
  /**
   * Start death animation for an entity
   */
  startDeathAnimation(entity, time) {
    const renderable = entity.getComponent(Renderable);
    if (!renderable || !renderable.model) {
      // No visual, remove immediately
      entity.remove();
      return;
    }
    
    const velocity = entity.getMutableComponent(Velocity);
    if (velocity) {
      // Dead things sink slowly
      velocity.x = 0;
      velocity.y = -0.8;
      velocity.z = 0;
      velocity.maxSpeed = 1;
    }
    
    this.deathAnimations.set(entity, {
      startTime: time,
      duration: this.DEATH_ANIMATION_DURATION,
      originalAlpha: renderable.model.visibility || 1.0,
      originalScale: renderable.model.scaling.clone(),
      entity: entity
    });
  }
  
  /**
   * Update death animations and remove finished entities
   */
  updateDeathAnimations(currentTime) {
    this.deathAnimations.forEach((animation, entity) => {
      const elapsed = currentTime - animation.startTime;
      const progress = Math.min(elapsed / animation.duration, 1.0);
      
      if (progress >= 1.0) {
        // Animation complete - remove entity
        console.log(`Removing dead entity ${entity.id}`);
        entity.remove();
        this.deathAnimations.delete(entity);
      } else {
        // Update animation - fade out and shrink
        const renderable = entity.getComponent(Renderable);
        if (renderable && renderable.model) {
          // Fade out
          const alpha = animation.originalAlpha * (1 - progress);
          renderable.model.visibility = alpha;
          
          // Shrink slightly
          const scale = 1 - (progress * 0.3);
          renderable.model.scaling.x = animation.originalScale.x * scale;
          renderable.model.scaling.y = animation.originalScale.y * scale;
          renderable.model.scaling.z = animation.originalScale.z * scale;
          
          // Rotate slowly as it sinks
          renderable.model.rotation.x = progress * Math.PI * 0.5;
          renderable.model.rotation.z = progress * Math.PI * 0.3;
        }
      }
    });
  }
}

DeathSystem.queries = {
  dead: { components: [Health] }
};
