import { Position } from '../components/Position.js';
import { Genetics } from '../components/Genetics.js';
import { Age } from '../components/Age.js';
import { Behavior } from '../components/Behavior.js';
import { Hunger } from '../components/Hunger.js';
import { Health } from '../components/Health.js';
import { Renderable } from '../components/Renderable.js';
import { FishFactory } from '../entities/FishFactory.js';
import { logger } from '../../utils/logger.js';

const BREED_DISTANCE = 4; // Closer proximity required
const MUTATION_RATE = 0.08; // 8% - slightly higher for more variation
const MUTATION_VARIATION = 0.15; // ±15% - more dramatic mutations
const BREED_DISTANCE_SQ = BREED_DISTANCE*BREED_DISTANCE;
const MIN_HEALTH_TO_BREED = 60; // Need good health to breed
const MAX_HUNGER_TO_BREED = 0.3; // Must be well-fed

/**
 * Enhanced Breeding System with visual animations
 */
export class BreedingSystem extends window.ECSY.System {
  init() {
    this.breedingAnimations = new Map(); // Track breeding animations
  }
  
  execute(delta, time) {
    const candidates = this.queries.fish.results;
    const n = candidates.length;
    
    // Process breeding
    for (let i = 0; i < n; i++) {
      const e1 = candidates[i];
      const age1 = e1.getComponent(Age);
      const beh1 = e1.getMutableComponent(Behavior);
      
      // Check breeding eligibility for first fish
      const hunger1 = e1.getComponent(Hunger);
      const health1 = e1.getComponent(Health);
      
      if (!age1.isAdult || 
          time - beh1.lastBreedTime < beh1.breedCooldown || 
          hunger1.value > MAX_HUNGER_TO_BREED ||
          (health1 && health1.current < MIN_HEALTH_TO_BREED)) {
        continue;
      }
      
      const pos1 = e1.getComponent(Position);
      
      for (let j = i + 1; j < n; j++) {
        const e2 = candidates[j];
        const age2 = e2.getComponent(Age);
        const beh2 = e2.getMutableComponent(Behavior);
        
        // Check breeding eligibility for second fish
        const hunger2 = e2.getComponent(Hunger);
        const health2 = e2.getComponent(Health);
        
        if (!age2.isAdult || 
            time - beh2.lastBreedTime < beh2.breedCooldown || 
            hunger2.value > MAX_HUNGER_TO_BREED ||
            (health2 && health2.current < MIN_HEALTH_TO_BREED)) {
          continue;
        }
        
        const pos2 = e2.getComponent(Position);
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        const dz = pos1.z - pos2.z;
        const distSq = dx*dx + dy*dy + dz*dz;
        
        if (distSq > BREED_DISTANCE_SQ) continue;
        
        // Successful breeding!
        const offspring = this.createOffspring(e1, e2);
        beh1.lastBreedTime = beh2.lastBreedTime = time;
        
        // Breeding costs energy - increase hunger slightly
        const hunger1Mut = e1.getMutableComponent(Hunger);
        const hunger2Mut = e2.getMutableComponent(Hunger);
        hunger1Mut.value = Math.min(1.0, hunger1Mut.value + 0.15);
        hunger2Mut.value = Math.min(1.0, hunger2Mut.value + 0.15);
        
        // Start breeding animation for both parents
        this.startBreedingAnimation(e1, time);
        this.startBreedingAnimation(e2, time);
        
        logger.debug(`Fish breeding successful! Offspring traits: size=${offspring.getComponent(Genetics).size.toFixed(2)}, speed=${offspring.getComponent(Genetics).speed.toFixed(2)}`);
        break;
      }
    }
    
    // Update breeding animations
    this.updateBreedingAnimations(delta / 1000);
  }

  createOffspring(parentA, parentB) {
    const gA = parentA.getComponent(Genetics);
    const gB = parentB.getComponent(Genetics);
    const childTraits = {};
    
    ['size','speed','metabolism'].forEach(trait => {
      const avg = (gA[trait] + gB[trait]) / 2;
      childTraits[trait] = this.mutateValue(avg);
    });
    
    // Color mutation per channel
    const colorAvg = [0,1,2].map(i => Math.round((gA.color[i] + gB.color[i]) / 2));
    const colorMut = colorAvg.map(c => this.mutateValue(c/255) * 255).map(v => Math.min(255, Math.max(0, Math.round(v))));
    childTraits.color = colorMut;
    
    // Position at parents midpoint with slight offset
    const posA = parentA.getComponent(Position);
    const posB = parentB.getComponent(Position);
    const childPos = {
      x: (posA.x + posB.x) / 2 + (Math.random() - 0.5) * 2,
      y: (posA.y + posB.y) / 2 + (Math.random() - 0.5) * 1,
      z: (posA.z + posB.z) / 2 + (Math.random() - 0.5) * 2
    };
    
    // Create offspring
    const offspring = FishFactory.create(this.world, {
      position: childPos,
      genetics: childTraits
    });
    
    logger.debug(`Offspring created with traits: size=${childTraits.size.toFixed(2)}, speed=${childTraits.speed.toFixed(2)}, metabolism=${childTraits.metabolism.toFixed(2)}`);
    return offspring;
  }

  mutateValue(val) {
    if (Math.random() < MUTATION_RATE) {
      const change = 1 + (Math.random() * 2 - 1) * MUTATION_VARIATION;
      return val * change;
    }
    return val;
  }
  
  /**
   * Start breeding animation for a fish
   */
  startBreedingAnimation(fish, time) {
    const renderable = fish.getComponent(Renderable);
    if (!renderable || !renderable.model) return;
    
    this.breedingAnimations.set(fish, {
      startTime: time,
      duration: 1000, // 1 second animation
      originalScale: renderable.model.scaling.clone(),
      originalRotation: renderable.model.rotation.clone(),
      fish: fish
    });
  }
  
  /**
   * Update breeding animations
   */
  updateBreedingAnimations(deltaTime) {
    const currentTime = performance.now();
    
    this.breedingAnimations.forEach((animation, fish) => {
      const elapsed = currentTime - animation.startTime;
      const progress = Math.min(elapsed / animation.duration, 1.0);
      
      if (progress >= 1.0) {
        // Animation complete - restore original transform
        const renderable = fish.getComponent(Renderable);
        if (renderable && renderable.model) {
          renderable.model.scaling.copyFrom(animation.originalScale);
          renderable.model.rotation.copyFrom(animation.originalRotation);
        }
        this.breedingAnimations.delete(fish);
      } else {
        // Update animation - create a courtship dance
        const renderable = fish.getComponent(Renderable);
        if (renderable && renderable.model) {
          // Pulsing scale effect
          const pulsePhase = progress * Math.PI * 4; // Multiple pulses
          const scaleMultiplier = 1.0 + Math.sin(pulsePhase) * 0.15;
          
          renderable.model.scaling.x = animation.originalScale.x * scaleMultiplier;
          renderable.model.scaling.y = animation.originalScale.y * scaleMultiplier;
          renderable.model.scaling.z = animation.originalScale.z * scaleMultiplier;
          
          // Gentle spinning motion
          const spinPhase = progress * Math.PI * 2;
          renderable.model.rotation.y = animation.originalRotation.y + Math.sin(spinPhase) * 0.3;
        }
      }
    });
  }
}

BreedingSystem.queries = {
  fish: { components: [Genetics, Age, Behavior, Position, Hunger, Renderable] }
}; 