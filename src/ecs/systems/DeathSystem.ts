import { ECSY } from '../ecsy';
import { Health } from '../components/Health';
import { Velocity } from '../components/Velocity';
import { Effects } from '../components/Effects';
import { FishTag } from '../components/Tags';
import { stats } from '../../core/stats';
import { logger } from '../../utils/logger';

const DEATH_DURATION_MS = 2400;

/** Plays the death animation (via Effects.dying) then removes the entity. */
export class DeathSystem extends ECSY.System {
  private started = new Map<any, number>();

  execute(_delta: number, time: number) {
    this.queries.dead.results.forEach((entity: any) => {
      const health = entity.getComponent(Health);
      if (!health.isDead) return;

      let start = this.started.get(entity);
      if (start === undefined) {
        start = time;
        this.started.set(entity, start);
        this.begin(entity, health);
      }

      const progress = Math.min(1, (time - start) / DEATH_DURATION_MS);
      if (entity.hasComponent(Effects)) entity.getMutableComponent(Effects).dying = Math.max(progress, 0.001);

      if (progress >= 1) {
        logger.debug(`Removing dead entity ${entity.id}`);
        this.started.delete(entity);
        entity.remove();
      }
    });
  }

  private begin(entity: any, health: any) {
    if (entity.hasComponent(FishTag)) {
      const cause = health.cause as keyof typeof stats.deaths;
      if (cause in stats.deaths) stats.deaths[cause]++;
    }
    const velocity = entity.getMutableComponent(Velocity);
    if (velocity) {
      velocity.x = velocity.z = 0;
      velocity.y = -0.9;
      velocity.maxSpeed = 1;
    }
  }
}

(DeathSystem as any).queries = {
  dead: { components: [Health] }
};
