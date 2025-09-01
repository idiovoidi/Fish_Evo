import { Hunger } from '../components/Hunger.js';
import { Behavior } from '../components/Behavior.js';
import { Health } from '../components/Health.js';
import { Genetics } from '../components/Genetics.js';
import { Velocity } from '../components/Velocity.js';

/**
 * Hunger System - Increases hunger over time and updates behavior accordingly
 */
export class HungerSystem extends window.ECSY.System {
  execute(delta, time) {
    // Convert delta to seconds
    const deltaTime = delta / 1000;
    
    // Process all entities with Hunger component
    this.queries.hungry.results.forEach(entity => {
      const hunger = entity.getMutableComponent(Hunger);  // Get mutable reference
      
      // Get genetics to apply metabolism rate
      const genetics = entity.getComponent(Genetics);
      const metabolismRate = genetics ? genetics.metabolism : 1.0;
      
      // Increase hunger based on metabolism
      const baseHungerRate = hunger.rate * metabolismRate;
      hunger.value = Math.min(1.0, hunger.value + baseHungerRate * deltaTime);
      
      // If entity also has behavior component, update hunger status
      if (entity.hasComponent(Behavior)) {
        const behavior = entity.getMutableComponent(Behavior);  // Get mutable reference
        
        // Update hunger status based on threshold
        behavior.isHungry = hunger.value > 0.5; // Hungry when over 50%
        
        // If extremely hungry, might affect health
        if (entity.hasComponent(Health) && hunger.value > 0.9) {
          const health = entity.getMutableComponent(Health);  // Get mutable reference
          
          // Very hungry entities take damage
          if (!health.isDead) {
            const starvationDamage = 5 * metabolismRate * deltaTime; // Scaled by metabolism
            health.current = Math.max(0, health.current - starvationDamage);
            
            // Check for death
            if (health.current <= 0) {
              health.isDead = true;
              health.current = 0;
              
              // Stop movement when dead
              if (entity.hasComponent(Velocity)) {
                const velocity = entity.getMutableComponent(Velocity);
                velocity.x = 0;
                velocity.y = -0.5; // Sink slowly
                velocity.z = 0;
              }
            }
          }
        }
        
        // Health regeneration when well-fed and healthy
        if (entity.hasComponent(Health) && hunger.value < 0.3) {
          const health = entity.getMutableComponent(Health);
          if (!health.isDead && health.current < health.max) {
            const regenRate = health.regenRate || 0.1;
            health.current = Math.min(health.max, health.current + regenRate * deltaTime);
          }
        }
      }
    });
  }
}

// Define queries - which entities this system should process
HungerSystem.queries = {
  hungry: { components: [Hunger] }
}; 