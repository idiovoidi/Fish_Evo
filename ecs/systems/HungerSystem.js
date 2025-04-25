import { Hunger } from '../components/Hunger.js';
import { Behavior } from '../components/Behavior.js';
import { Health } from '../components/Health.js';

/**
 * Hunger System - Increases hunger over time and updates behavior accordingly
 */
export class HungerSystem extends window.ECSY.System {
  execute(delta, time) {
    // Convert delta to seconds
    const deltaTime = delta / 1000;
    
    // Process all entities with Hunger component
    this.queries.hungry.results.forEach(entity => {
      const hunger = entity.getComponent(Hunger);
      
      // Increase hunger
      hunger.value = Math.min(1.0, hunger.value + hunger.rate * deltaTime);
      
      // If entity also has behavior component, update hunger status
      if (entity.hasComponent(Behavior)) {
        const behavior = entity.getComponent(Behavior);
        
        // Update hunger status based on threshold
        behavior.isHungry = hunger.value > 0.5; // Hungry when over 50%
        
        // If extremely hungry, might affect health
        if (entity.hasComponent(Health) && hunger.value > 0.9) {
          const health = entity.getComponent(Health);
          
          // Very hungry entities take damage
          if (!health.isDead) {
            health.current = Math.max(0, health.current - deltaTime * 2); // 2 health per second when starving
            
            // Check for death
            if (health.current <= 0) {
              health.isDead = true;
              health.current = 0;
            }
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