import { ECSY } from '../ecsy';
import { Position } from '../components/Position';
import { Velocity } from '../components/Velocity';
import { Behavior } from '../components/Behavior';
import { Hunger } from '../components/Hunger';
import { Health } from '../components/Health';
import { Genetics } from '../components/Genetics';
import { Age } from '../components/Age';
import { Effects } from '../components/Effects';
import { Renderable } from '../components/Renderable';
import { FishTag } from '../components/Tags';
import { FishFactory } from '../entities/FishFactory';
import { logger } from '../../utils/logger';

const BREED_DISTANCE = 4;
const MAX_FISH = 100;
const TRAIT_LIMITS = { size: [0.55, 2.2], speed: [2.5, 12], metabolism: [0.5, 1.8] } as const;
const BREED_DISTANCE_SQ = BREED_DISTANCE * BREED_DISTANCE;
const MIN_HEALTH_TO_BREED = 60;
const MAX_HUNGER_TO_BREED = 0.4;

export class BreedingSystem extends ECSY.System {
  execute(delta: number, time: number) {
    const candidates = this.queries.fish.results;
    const n = candidates.length;
    if (n >= MAX_FISH) return;
    
    for (let i = 0; i < n; i++) {
      const e1 = candidates[i];
      const age1 = e1.getComponent(Age);
      const beh1 = e1.getMutableComponent(Behavior);
      
      const hunger1 = e1.getComponent(Hunger);
      const health1 = e1.getComponent(Health);
      
      if (!age1.isAdult || 
          time - beh1.lastBreedTime < beh1.breedCooldown || 
          hunger1.value > MAX_HUNGER_TO_BREED ||
          (health1 && (health1.isDead || health1.current < MIN_HEALTH_TO_BREED))) {
        continue;
      }
      
      const pos1 = e1.getComponent(Position);
      
      for (let j = i + 1; j < n; j++) {
        const e2 = candidates[j];
        const age2 = e2.getComponent(Age);
        const beh2 = e2.getMutableComponent(Behavior);
        
        const hunger2 = e2.getComponent(Hunger);
        const health2 = e2.getComponent(Health);
        
        if (!age2.isAdult || 
            time - beh2.lastBreedTime < beh2.breedCooldown || 
            hunger2.value > MAX_HUNGER_TO_BREED ||
            (health2 && (health2.isDead || health2.current < MIN_HEALTH_TO_BREED))) {
          continue;
        }
        
        const pos2 = e2.getComponent(Position);
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        const dz = pos1.z - pos2.z;
        const distSq = dx*dx + dy*dy + dz*dz;
        
        if (distSq > BREED_DISTANCE_SQ) continue;
        
        const offspring = this.createOffspring(e1, e2);
        beh1.lastBreedTime = beh2.lastBreedTime = time;
        
        const hunger1Mut = e1.getMutableComponent(Hunger);
        const hunger2Mut = e2.getMutableComponent(Hunger);
        hunger1Mut.value = Math.min(1.0, hunger1Mut.value + 0.15);
        hunger2Mut.value = Math.min(1.0, hunger2Mut.value + 0.15);
        
        for (const parent of [e1, e2]) {
          const fx = parent.getMutableComponent(Effects);
          if (fx) { fx.pulse = 1; fx.flash = 1; }
        }
        
        logger.debug(`Fish breeding successful! Offspring traits: size=${offspring.getComponent(Genetics).size.toFixed(2)}, speed=${offspring.getComponent(Genetics).speed.toFixed(2)}`);
        break;
      }
    }
  }

  createOffspring(parentA: any, parentB: any) {
    const gA = parentA.getComponent(Genetics);
    const gB = parentB.getComponent(Genetics);
    const childTraits: any = {};

    (['size', 'speed', 'metabolism'] as const).forEach((trait) => {
      const [lo, hi] = TRAIT_LIMITS[trait];
      // Each trait is inherited from a blend of the parents, then perturbed.
      const mix = Math.random();
      const inherited = gA[trait] * mix + gB[trait] * (1 - mix);
      childTraits[trait] = Math.min(hi, Math.max(lo, this.mutate(inherited)));
    });

    const mix = Math.random();
    childTraits.color = [0, 1, 2].map((i) => {
      const blended = (gA.color[i] * mix + gB.color[i] * (1 - mix)) / 255;
      return Math.min(255, Math.max(0, Math.round(this.mutate(blended, 0.05) * 255)));
    });
    childTraits.generation = Math.max(gA.generation, gB.generation) + 1;

    const posA = parentA.getComponent(Position);
    const posB = parentB.getComponent(Position);
    const childPos = {
      x: (posA.x + posB.x) / 2 + (Math.random() - 0.5) * 2,
      y: (posA.y + posB.y) / 2 + (Math.random() - 0.5) * 1,
      z: (posA.z + posB.z) / 2 + (Math.random() - 0.5) * 2
    };

    const offspring = FishFactory.create(this.world, { position: childPos, genetics: childTraits });
    logger.debug(`Offspring gen ${childTraits.generation}: size=${childTraits.size.toFixed(2)}, speed=${childTraits.speed.toFixed(2)}, metabolism=${childTraits.metabolism.toFixed(2)}`);
    return offspring;
  }

  /** Small drift every time, with the occasional larger leap. */
  mutate(value: number, scale = 1): number {
    const sigma = (Math.random() < 0.12 ? 0.14 : 0.035) * scale;
    const gaussian = (Math.random() + Math.random() + Math.random() - 1.5) * 1.15;
    return value * (1 + gaussian * sigma * 2);
  }
}

(BreedingSystem as any).queries = {
  fish: { components: [Genetics, Age, Behavior, Position, Hunger, Renderable] }
};
