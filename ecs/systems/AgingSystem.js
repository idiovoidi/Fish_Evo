import { Age } from '../components/Age.js';
import { Health } from '../components/Health.js';
import { FishTag } from '../components/Tags.js';

/**
 * Aging System - Updates entity age and handles maturity and death from old age
 */
export class AgingSystem extends window.ECSY.System {
  execute(delta, time) {
    const deltaTime = delta / 1000; // Convert to seconds
    
    this.queries.aging.results.forEach(entity => {
      const age = entity.getMutableComponent(Age);
      const health = entity.getMutableComponent(Health);
      
      // Increase age
      age.value += deltaTime;
      
      // Check for maturity
      if (!age.isAdult && age.value >= age.maturityAge) {
        age.isAdult = true;
        console.log(`Fish reached maturity at age ${age.value.toFixed(1)} seconds`);
      }
      
      // Handle aging effects on health
      if (health && !health.isDead) {
        // Old age starts affecting health at 80% of max age
        const oldAgeThreshold = age.maxAge * 0.8;
        
        if (age.value > oldAgeThreshold) {
          // Progressive health decline with age
          const ageProgress = (age.value - oldAgeThreshold) / (age.maxAge - oldAgeThreshold);
          const agingDamage = ageProgress * 2 * deltaTime; // Gradual damage from aging
          
          health.current = Math.max(0, health.current - agingDamage);
          
          // Death from old age
          if (health.current <= 0) {
            health.isDead = true;
            console.log(`Fish died of old age at ${age.value.toFixed(1)} seconds`);
          }
        }
        
        // Death from maximum age (even if healthy)
        if (age.value >= age.maxAge) {
          health.isDead = true;
          health.current = 0;
          console.log(`Fish died of natural causes at maximum age of ${age.maxAge} seconds`);
        }
      }
    });
  }
}

AgingSystem.queries = {
  aging: { components: [Age] }
};