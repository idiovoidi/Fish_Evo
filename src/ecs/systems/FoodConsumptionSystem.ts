import { ECSY } from '../ecsy';
import { Position } from '../components/Position';
import { Hunger } from '../components/Hunger';
import { Behavior } from '../components/Behavior';
import { Health } from '../components/Health';
import { Velocity } from '../components/Velocity';
import { Effects } from '../components/Effects';
import { FishTag, FoodTag } from '../components/Tags';
import { SpatialHashSystem } from './SpatialHashSystem';
import { clampVelocity, distance } from '../../utils/velocity';
import { logger } from '../../utils/logger';

const FOOD_DETECTION_RADIUS = 9.0;
const FOOD_CONSUMPTION_RADIUS = 2.2;
const FOOD_ENERGY_VALUE = 0.4;
const FOOD_SEEK_MULTIPLIER = 3.5;

export class FoodConsumptionSystem extends ECSY.System {
  spatial: any;

  init() {
    this.spatial = this.world.getSystem(SpatialHashSystem);
  }

  execute(delta: number, time: number) {
    const deltaTime = delta / 1000;
    
    this.queries.fish.results.forEach((fish: any) => {
      const fishPos = fish.getComponent(Position);
      const fishVel = fish.getMutableComponent(Velocity);
      const fishHunger = fish.getMutableComponent(Hunger);
      const fishBehavior = fish.getMutableComponent(Behavior);
      const fishHealth = fish.getComponent(Health);
      
      if (fishHealth && fishHealth.isDead) return;
      
      const nearbyFood = this.spatial.getEntitiesNear(fishPos, FOOD_DETECTION_RADIUS + fishHunger.value * 8, FoodTag);
      
      if (nearbyFood.length === 0) {
        fishBehavior.isHungry = fishHunger.value > 0.5;
        return;
      }
      
      let closestFood: any = null;
      let closestDistance = Infinity;
      
      nearbyFood.forEach((food: any) => {
        const foodPos = food.getComponent(Position);
        if (!foodPos) return;
        const d = distance(fishPos, foodPos);
        if (d < closestDistance) {
          closestDistance = d;
          closestFood = food;
        }
      });
      
      if (!closestFood || !closestFood.alive) return;
      
      const foodPos = closestFood.getComponent(Position);
      
      if (closestDistance <= FOOD_CONSUMPTION_RADIUS) {
        this.consumeFood(fish, closestFood, time);
      } else if (fishBehavior.isHungry || fishHunger.value > 0.3) {
        this.pursueFood(fish, fishPos, foodPos, fishVel, deltaTime, fishHunger.value);
      }
    });
  }
  
  pursueFood(fish: any, fishPos: any, foodPos: any, fishVel: any, deltaTime: number, hungerLevel: number) {
    const behavior = fish.getMutableComponent(Behavior);
    behavior.isHungry = true;
    
    const dx = foodPos.x - fishPos.x;
    const dy = foodPos.y - fishPos.y;
    const dz = foodPos.z - fishPos.z;
    const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
    
    if (dist > 0) {
      const dirX = dx / dist;
      const dirY = dy / dist;
      const dirZ = dz / dist;
      
      const desperationMultiplier = 1 + (hungerLevel * 1.5);
      
      const seekForce = FOOD_SEEK_MULTIPLIER * deltaTime * desperationMultiplier;
      fishVel.x += dirX * seekForce;
      fishVel.y += dirY * seekForce * 0.8;
      fishVel.z += dirZ * seekForce;
      
      clampVelocity(fishVel, { maxSpeedMultiplier: 1.2 + hungerLevel * 0.3 });
    }
  }
  
  consumeFood(fish: any, food: any, time: number) {
    const fishHunger = fish.getMutableComponent(Hunger);
    const fishBehavior = fish.getMutableComponent(Behavior);
    const fishHealth = fish.getMutableComponent(Health);
    
    fishHunger.value = Math.max(0, fishHunger.value - FOOD_ENERGY_VALUE);
    fishHunger.lastFed = time;
    fishBehavior.isHungry = fishHunger.value > 0.5;
    
    if (fishHunger.value < 0.3 && fishHealth && !fishHealth.isDead) {
      fishHealth.current = Math.min(fishHealth.max, fishHealth.current + 5);
    }
    
    const fx = fish.getMutableComponent(Effects);
    if (fx) { fx.pulse = 1; fx.flash = Math.max(fx.flash, 0.5); }
    
    food.remove();
    logger.debug(`Fish consumed food! Hunger: ${fishHunger.value.toFixed(2)}, Health: ${fishHealth?.current ?? 'N/A'}`);
  }
}

(FoodConsumptionSystem as any).queries = {
  fish: { components: [FishTag, Position, Velocity, Hunger, Behavior] }
};
