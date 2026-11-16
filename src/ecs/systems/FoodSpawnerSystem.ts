import { ECSY } from '../ecsy';
import { FoodFactory } from '../entities/FoodFactory';
import { FoodTag } from '../components/Tags';
import { Lifespan } from '../components/Lifespan';
import { Renderable } from '../components/Renderable';
import { SimulationConfig } from '../../config/simulation_config';

/** Drops pellets from the surface and dissolves the ones nobody eats. */
export class FoodSpawnerSystem extends ECSY.System {
  lastSpawnTime = 0;
  spawnInterval = SimulationConfig.food.spawnInterval;
  maxFoodCount = SimulationConfig.food.maxPellets;
  /** 0..1; the day/night cycle thins the supply after dark. */
  daylight = 1;
  enabled = true;

  execute(delta: number, time: number) {
    const dt = delta / 1000;

    this.queries.food.results.forEach((food: any) => {
      const life = food.getMutableComponent(Lifespan);
      life.age += dt;
      if (life.age >= life.max) {
        food.remove();
        return;
      }
      // Shrink away over the final few seconds.
      const remaining = life.max - life.age;
      if (remaining < 4) {
        const r = food.getComponent(Renderable);
        if (r?.model) r.model.scaling.setAll(r.scale * Math.max(0.05, remaining / 4));
      }
    });

    // Fewer pellets drift down at night.
    const interval = this.spawnInterval / (0.35 + 0.65 * this.daylight);
    if (this.enabled && time - this.lastSpawnTime > interval) {
      this.lastSpawnTime = time;
      const missing = this.maxFoodCount - this.queries.food.results.length;
      const count = Math.min(missing, 1 + Math.floor(Math.random() * 3));
      for (let i = 0; i < count; i++) FoodFactory.create(this.world);
    }
  }
}

(FoodSpawnerSystem as any).queries = {
  food: { components: [FoodTag, Lifespan] }
};
