import { ECSY } from '../ecsy';
import { Hunger } from '../components/Hunger';
import { Behavior } from '../components/Behavior';
import { Health } from '../components/Health';
import { Genetics } from '../components/Genetics';
import { logger } from '../../utils/logger';

export class HungerSystem extends ECSY.System {
  execute(delta: number, _time: number) {
    const deltaTime = delta / 1000;
    
    this.queries.hungry.results.forEach((entity: any) => {
      const hunger = entity.getMutableComponent(Hunger);
      
      const genetics = entity.getComponent(Genetics);
      const metabolismRate = genetics ? genetics.metabolism : 1.0;
      
      // Fast swimmers burn more energy.
      const speedCost = genetics ? 0.75 + 0.25 * (genetics.speed / 6) : 1;
      const baseHungerRate = hunger.rate * metabolismRate * speedCost;
      hunger.value = Math.min(1.0, hunger.value + baseHungerRate * deltaTime);
      
      if (entity.hasComponent(Behavior)) {
        const behavior = entity.getMutableComponent(Behavior);
        
        behavior.isHungry = hunger.value > 0.4;
        
        if (entity.hasComponent(Health) && hunger.value > 0.7) {
          const health = entity.getMutableComponent(Health);
          
          if (!health.isDead) {
            const hungerSeverity = Math.max(0, hunger.value - 0.7) / 0.3;
            const starvationDamage = 1.6 * Math.pow(hungerSeverity, 2) * metabolismRate * deltaTime;
            health.current = Math.max(0, health.current - starvationDamage);
            
            if (health.current <= 0) {
              health.isDead = true;
              health.cause = 'starvation';
              health.current = 0;
              logger.debug(`Entity ${entity.id} died from starvation (hunger: ${hunger.value.toFixed(2)})`);
            }
          }
        }
        
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

(HungerSystem as any).queries = {
  hungry: { components: [Hunger] }
};
