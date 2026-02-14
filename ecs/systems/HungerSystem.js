import { Hunger } from '../components/Hunger.js';
import { Behavior } from '../components/Behavior.js';
import { Health } from '../components/Health.js';
import { Genetics } from '../components/Genetics.js';
import { logger } from '../../utils/logger.js';

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
        behavior.isHungry = hunger.value > 0.4; // Hungry when over 40%
        
        // Starvation damage increases with hunger level
        if (entity.hasComponent(Health) && hunger.value > 0.7) {
          const health = entity.getMutableComponent(Health);  // Get mutable reference
          
          // Hungry entities take damage, scaling with hunger severity
          if (!health.isDead) {
            // Damage starts at 70% hunger and increases exponentially
            const hungerSeverity = Math.max(0, hunger.value - 0.7) / 0.3; // 0 to 1 scale
            const starvationDamage = 3 * Math.pow(hungerSeverity, 2) * metabolismRate * deltaTime;
            health.current = Math.max(0, health.current - starvationDamage);
            
            // Mark dead; DeathSystem will handle sinking and removal
            if (health.current <= 0) {
              health.isDead = true;
              health.current = 0;
              logger.debug(`Entity ${entity.id} died from starvation (hunger: ${hunger.value.toFixed(2)})`);
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