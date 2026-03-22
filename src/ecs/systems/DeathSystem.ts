import { Health } from '../components/Health';
import { Renderable } from '../components/Renderable';
import { Velocity } from '../components/Velocity';
import { logger } from '../../utils/logger';

interface AnimationData {
  startTime: number;
  duration: number;
  originalAlpha: number;
  originalScale: any;
  entity: any;
}

export class DeathSystem extends (window as any).ECSY.System {
  deathAnimations: Map<any, AnimationData> = new Map();
  DEATH_ANIMATION_DURATION: number = 2000;

  init() {
    this.deathAnimations = new Map();
    this.DEATH_ANIMATION_DURATION = 2000;
  }

  execute(_delta: number, time: number) {
    this.queries.dead.results.forEach((entity: any) => {
      const health = entity.getComponent(Health);
      
      if (health.isDead && !this.deathAnimations.has(entity)) {
        this.startDeathAnimation(entity, time);
        logger.debug(`Entity ${entity.id} has died`);
      }
    });
    
    this.updateDeathAnimations(time);
  }
  
  startDeathAnimation(entity: any, time: number) {
    const renderable = entity.getComponent(Renderable);
    if (!renderable || !renderable.model) {
      entity.remove();
      return;
    }
    
    const velocity = entity.getMutableComponent(Velocity);
    if (velocity) {
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
  
  updateDeathAnimations(currentTime: number) {
    this.deathAnimations.forEach((animation, entity) => {
      const elapsed = currentTime - animation.startTime;
      const progress = Math.min(elapsed / animation.duration, 1.0);
      
      if (progress >= 1.0) {
        logger.debug(`Removing dead entity ${entity.id}`);
        entity.remove();
        this.deathAnimations.delete(entity);
      } else {
        const renderable = entity.getComponent(Renderable);
        if (renderable && renderable.model) {
          const alpha = animation.originalAlpha * (1 - progress);
          renderable.model.visibility = alpha;
          
          const scale = 1 - (progress * 0.3);
          renderable.model.scaling.x = animation.originalScale.x * scale;
          renderable.model.scaling.y = animation.originalScale.y * scale;
          renderable.model.scaling.z = animation.originalScale.z * scale;
          
          renderable.model.rotation.x = progress * Math.PI * 0.5;
          renderable.model.rotation.z = progress * Math.PI * 0.3;
        }
      }
    });
  }
}

(DeathSystem as any).queries = {
  dead: { components: [Health] }
};
