import { Position } from '../components/Position.js';
import { Hunger } from '../components/Hunger.js';
import { Behavior } from '../components/Behavior.js';
import { Health } from '../components/Health.js';
import { Velocity } from '../components/Velocity.js';
import { Renderable } from '../components/Renderable.js';
import { FishTag, FoodTag } from '../components/Tags.js';
import { SpatialHashSystem } from './SpatialHashSystem.js';

const FOOD_DETECTION_RADIUS = 8.0; // Increased detection range
const FOOD_CONSUMPTION_RADIUS = 1.5;
const FOOD_ENERGY_VALUE = 0.4; // How much hunger is reduced per food item
const FOOD_SEEK_MULTIPLIER = 3.5; // Stronger speed boost when seeking food

/**
 * Food Consumption System - Handles fish finding, pursuing, and eating food
 */
export class FoodConsumptionSystem extends window.ECSY.System {
  init() {
    this.spatial = this.world.getSystem(SpatialHashSystem);
    this.eatingAnimations = new Map(); // Track eating animations
  }

  execute(delta, time) {
    const deltaTime = delta / 1000;
    
    this.queries.fish.results.forEach(fish => {
      const fishPos = fish.getComponent(Position);
      const fishVel = fish.getMutableComponent(Velocity);
      const fishHunger = fish.getMutableComponent(Hunger);
      const fishBehavior = fish.getMutableComponent(Behavior);
      const fishHealth = fish.getComponent(Health);
      
      // Skip dead fish
      if (fishHealth && fishHealth.isDead) return;
      
      // Look for nearby food
      const nearbyFood = this.spatial.getEntitiesNear(fishPos, FOOD_DETECTION_RADIUS, FoodTag);
      
      if (nearbyFood.length === 0) {
        fishBehavior.isHungry = fishHunger.value > 0.5;
        return;
      }
      
      // Find the closest food
      let closestFood = null;
      let closestDistance = Infinity;
      
      nearbyFood.forEach(food => {
        const foodPos = food.getComponent(Position);
        if (!foodPos) return;
        
        const distance = this.getDistance(fishPos, foodPos);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestFood = food;
        }
      });
      
      if (!closestFood) return;
      
      const foodPos = closestFood.getComponent(Position);
      
      // Check if close enough to consume
      if (closestDistance <= FOOD_CONSUMPTION_RADIUS) {
        this.consumeFood(fish, closestFood, time);
      } else if (fishBehavior.isHungry || fishHunger.value > 0.3) {
        // Pursue the food if hungry (lowered threshold for more active feeding)
        this.pursueFood(fish, fishPos, foodPos, fishVel, deltaTime, fishHunger.value);
      }
    });
    
    // Update eating animations
    this.updateEatingAnimations(deltaTime);
  }
  
  /**
   * Make fish pursue food with desperation scaling
   */
  pursueFood(fish, fishPos, foodPos, fishVel, deltaTime, hungerLevel) {
    const behavior = fish.getMutableComponent(Behavior);
    behavior.isHungry = true;
    
    // Calculate direction to food
    const dx = foodPos.x - fishPos.x;
    const dy = foodPos.y - fishPos.y;
    const dz = foodPos.z - fishPos.z;
    const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
    
    if (distance > 0) {
      // Normalize direction
      const dirX = dx / distance;
      const dirY = dy / distance;
      const dirZ = dz / distance;
      
      // Desperation increases with hunger - starving fish move faster
      const desperationMultiplier = 1 + (hungerLevel * 1.5); // 1x to 2.5x based on hunger
      
      // Apply food-seeking force
      const seekForce = FOOD_SEEK_MULTIPLIER * deltaTime * desperationMultiplier;
      fishVel.x += dirX * seekForce;
      fishVel.y += dirY * seekForce * 0.8; // Slightly better vertical pursuit
      fishVel.z += dirZ * seekForce;
      
      // Limit speed - hungrier fish can go faster
      const maxSpeedMultiplier = 1.2 + (hungerLevel * 0.3); // Up to 1.5x when starving
      const currentSpeed = Math.sqrt(fishVel.x*fishVel.x + fishVel.y*fishVel.y + fishVel.z*fishVel.z);
      if (currentSpeed > fishVel.maxSpeed * maxSpeedMultiplier) {
        const scale = (fishVel.maxSpeed * maxSpeedMultiplier) / currentSpeed;
        fishVel.x *= scale;
        fishVel.y *= scale;
        fishVel.z *= scale;
      }
    }
  }
  
  /**
   * Consume food and restore hunger/health
   */
  consumeFood(fish, food, time) {
    const fishHunger = fish.getMutableComponent(Hunger);
    const fishBehavior = fish.getMutableComponent(Behavior);
    const fishHealth = fish.getMutableComponent(Health);
    
    // Reduce hunger
    fishHunger.value = Math.max(0, fishHunger.value - FOOD_ENERGY_VALUE);
    fishHunger.lastFed = time; // Track when fish last ate
    fishBehavior.isHungry = fishHunger.value > 0.5;
    
    // Restore some health if well-fed
    if (fishHunger.value < 0.3 && fishHealth && !fishHealth.isDead) {
      fishHealth.current = Math.min(fishHealth.max, fishHealth.current + 5);
    }
    
    // Start eating animation
    this.startEatingAnimation(fish, time);
    
    // Remove the food entity
    food.remove();
    
    console.log(`Fish consumed food! Hunger: ${fishHunger.value.toFixed(2)}, Health: ${fishHealth?.current || 'N/A'}`);
  }
  
  /**
   * Start eating animation for a fish
   */
  startEatingAnimation(fish, time) {
    const renderable = fish.getComponent(Renderable);
    if (!renderable || !renderable.model) return;
    
    this.eatingAnimations.set(fish, {
      startTime: time,
      duration: 500, // 500ms animation
      originalScale: renderable.model.scaling.clone(),
      fish: fish
    });
  }
  
  /**
   * Update eating animations
   */
  updateEatingAnimations(deltaTime) {
    const currentTime = performance.now();
    
    this.eatingAnimations.forEach((animation, fish) => {
      const elapsed = currentTime - animation.startTime;
      const progress = Math.min(elapsed / animation.duration, 1.0);
      
      if (progress >= 1.0) {
        // Animation complete
        const renderable = fish.getComponent(Renderable);
        if (renderable && renderable.model) {
          renderable.model.scaling.copyFrom(animation.originalScale);
        }
        this.eatingAnimations.delete(fish);
      } else {
        // Update animation
        const renderable = fish.getComponent(Renderable);
        if (renderable && renderable.model) {
          // Create a "gulp" effect - scale up then down
          const animPhase = progress * Math.PI * 2;
          const scaleMultiplier = 1.0 + Math.sin(animPhase) * 0.2;
          
          renderable.model.scaling.x = animation.originalScale.x * scaleMultiplier;
          renderable.model.scaling.y = animation.originalScale.y * scaleMultiplier;
          renderable.model.scaling.z = animation.originalScale.z * scaleMultiplier;
        }
      }
    });
  }
  
  /**
   * Calculate distance between two positions
   */
  getDistance(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx*dx + dy*dy + dz*dz);
  }
}

FoodConsumptionSystem.queries = {
  fish: { components: [FishTag, Position, Velocity, Hunger, Behavior] }
};