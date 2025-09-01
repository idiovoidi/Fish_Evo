import { Position } from '../components/Position.js';
import { Genetics } from '../components/Genetics.js';
import { Age } from '../components/Age.js';
import { Behavior } from '../components/Behavior.js';
import { Hunger } from '../components/Hunger.js';
import { Renderable } from '../components/Renderable.js';
import { FishFactory } from '../entities/FishFactory.js';

const BREED_DISTANCE = 5;
const MUTATION_RATE = 0.05; // 5%
const MUTATION_VARIATION = 0.1; // ±10%
const BREED_DISTANCE_SQ = BREED_DISTANCE*BREED_DISTANCE;

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
      if (!age1.isAdult || time - beh1.lastBreedTime < beh1.breedCooldown || e1.getComponent(Hunger).value > 0.2) {
        continue;
      }
      
      const pos1 = e1.getComponent(Position);
      
      for (let j = i + 1; j < n; j++) {
        const e2 = candidates[j];
        const age2 = e2.getComponent(Age);
        const beh2 = e2.getMutableComponent(Behavior);
        
        // Check breeding eligibility for second fish
        if (!age2.isAdult || time - beh2.lastBreedTime < beh2.breedCooldown || e2.getComponent(Hunger).value > 0.2) {
          continue;
        }
        
        const pos2 = e2.getComponent(Position);
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        const dz = pos1.z - pos2.z;
        const distSq = dx*dx + dy*dy + dz*dz;
        
        if (distSq > BREED_DISTANCE_SQ) continue;
        
        // Successful breeding!
        this.createOffspring(e1, e2);
        beh1.lastBreedTime = beh2.lastBreedTime = time;
        
        // Start breeding animation for both parents
        this.startBreedingAnimation(e1, time);
        this.startBreedingAnimation(e2, time);
        
        console.log('Fish breeding successful!');
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
    
    console.log(`Offspring created with traits: size=${childTraits.size.toFixed(2)}, speed=${childTraits.speed.toFixed(2)}, metabolism=${childTraits.metabolism.toFixed(2)}`);
    
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