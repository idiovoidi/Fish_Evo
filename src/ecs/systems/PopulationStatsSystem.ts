import { ECSY } from '../ecsy';
import { CrabTag, FishTag, FoodTag, SharkTag } from '../components/Tags';
import { Health } from '../components/Health';
import { Hunger } from '../components/Hunger';
import { Age } from '../components/Age';
import { Genetics } from '../components/Genetics';
import { HISTORY_LENGTH, stats } from '../../core/stats';

const REFRESH_MS = 500;
const HISTORY_EVERY_MS = 2000;

/** Aggregates the ecosystem into `stats` for the HUD (and tracks births). */
export class PopulationStatsSystem extends ECSY.System {
  private lastRefresh = -Infinity;
  private lastHistory = -Infinity;
  private seeded = false;

  execute(_delta: number, time: number) {
    // Anything added after the founding population counts as a birth.
    if (this.seeded) stats.births += this.queries.fish.added.length;
    else if (this.queries.fish.results.length > 0) this.seeded = true;

    if (time - this.lastRefresh < REFRESH_MS) return;
    this.lastRefresh = time;

    const fishList = this.queries.fish.results;
    let hunger = 0, health = 0, size = 0, speed = 0, metabolism = 0;
    let r = 0, g = 0, b = 0, adults = 0, oldest = 0, generation = 0, n = 0;

    for (const fish of fishList) {
      const hp = fish.getComponent(Health);
      if (hp?.isDead) continue;
      n++;
      const genes = fish.getComponent(Genetics);
      const age = fish.getComponent(Age);
      hunger += fish.getComponent(Hunger)?.value ?? 0;
      health += hp ? hp.current / hp.max : 1;
      size += genes.size;
      speed += genes.speed;
      metabolism += genes.metabolism;
      r += genes.color[0]; g += genes.color[1]; b += genes.color[2];
      generation = Math.max(generation, genes.generation);
      if (age?.isAdult) adults++;
      if (age) oldest = Math.max(oldest, age.value);
    }

    const avg = (v: number) => (n > 0 ? v / n : 0);
    stats.fish = n;
    stats.adults = adults;
    stats.juveniles = n - adults;
    stats.sharks = this.queries.sharks.results.length;
    stats.crabs = this.queries.crabs.results.length;
    stats.food = this.queries.food.results.length;
    stats.avgHunger = avg(hunger);
    stats.avgHealth = avg(health);
    stats.avgSize = avg(size);
    stats.avgSpeed = avg(speed);
    stats.avgMetabolism = avg(metabolism);
    if (n > 0) stats.avgColor = [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
    stats.oldestAge = oldest;
    stats.maxGeneration = Math.max(stats.maxGeneration, generation);

    if (time - this.lastHistory >= HISTORY_EVERY_MS) {
      this.lastHistory = time;
      const h = stats.history;
      h.time.push(time / 1000);
      h.fish.push(n);
      h.speed.push(stats.avgSpeed);
      h.size.push(stats.avgSize);
      if (h.time.length > HISTORY_LENGTH) {
        h.time.shift(); h.fish.shift(); h.speed.shift(); h.size.shift();
      }
    }
  }
}

(PopulationStatsSystem as any).queries = {
  fish: { components: [FishTag, Genetics], listen: { added: true } },
  food: { components: [FoodTag] },
  sharks: { components: [SharkTag] },
  crabs: { components: [CrabTag] }
};
