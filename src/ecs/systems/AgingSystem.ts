import { ECSY } from '../ecsy';
import { Age } from '../components/Age';
import { Health } from '../components/Health';
import { logger } from '../../utils/logger';

export class AgingSystem extends ECSY.System {
  execute(delta: number, _time: number) {
    const deltaTime = delta / 1000;
    
    this.queries.aging.results.forEach((entity: any) => {
      const age = entity.getMutableComponent(Age);
      const health = entity.getMutableComponent(Health);
      
      age.value += deltaTime;
      
      if (!age.isAdult && age.value >= age.maturityAge) {
        age.isAdult = true;
        logger.debug(`Reached maturity at age ${age.value.toFixed(1)}s`);
      }
      
      if (health && !health.isDead) {
        const oldAgeThreshold = age.maxAge * 0.8;
        
        if (age.value > oldAgeThreshold) {
          const ageProgress = (age.value - oldAgeThreshold) / (age.maxAge - oldAgeThreshold);
          const agingDamage = ageProgress * 2 * deltaTime;
          
          health.current = Math.max(0, health.current - agingDamage);
          
          if (health.current <= 0) {
            health.isDead = true;
            health.cause = 'age';
          }
        }
        
        if (age.value >= age.maxAge) {
          health.isDead = true;
          health.cause = 'age';
          health.current = 0;
        }
      }
    });
  }
}

(AgingSystem as any).queries = {
  aging: { components: [Age] }
};
