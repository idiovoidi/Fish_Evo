import { Position } from '../components/Position';
import { Hunger } from '../components/Hunger';
import { Behavior } from '../components/Behavior';
import { Health } from '../components/Health';
import { Velocity } from '../components/Velocity';
import { Renderable } from '../components/Renderable';
import { FishTag, FoodTag } from '../components/Tags';
import { clampVelocity, distance } from '../../utils/velocity';
import { logger } from '../../utils/logger';
const FOOD_DETECTION_RADIUS = 8.0;
const FOOD_CONSUMPTION_RADIUS = 1.5;
const FOOD_ENERGY_VALUE = 0.4;
const FOOD_SEEK_MULTIPLIER = 3.5;
export class FoodConsumptionSystem extends window.ECSY.System {
    constructor() {
        super(...arguments);
        this.eatingAnimations = new Map();
    }
    init() {
        this.spatial = this.world.getSystem('SpatialHashSystem');
        this.eatingAnimations = new Map();
    }
    execute(delta, time) {
        const deltaTime = delta / 1000;
        this.queries.fish.results.forEach((fish) => {
            const fishPos = fish.getComponent(Position);
            const fishVel = fish.getMutableComponent(Velocity);
            const fishHunger = fish.getMutableComponent(Hunger);
            const fishBehavior = fish.getMutableComponent(Behavior);
            const fishHealth = fish.getComponent(Health);
            if (fishHealth && fishHealth.isDead)
                return;
            const nearbyFood = this.spatial.getEntitiesNear(fishPos, FOOD_DETECTION_RADIUS, FoodTag);
            if (nearbyFood.length === 0) {
                fishBehavior.isHungry = fishHunger.value > 0.5;
                return;
            }
            let closestFood = null;
            let closestDistance = Infinity;
            nearbyFood.forEach((food) => {
                const foodPos = food.getComponent(Position);
                if (!foodPos)
                    return;
                const d = distance(fishPos, foodPos);
                if (d < closestDistance) {
                    closestDistance = d;
                    closestFood = food;
                }
            });
            if (!closestFood)
                return;
            const foodPos = closestFood.getComponent(Position);
            if (closestDistance <= FOOD_CONSUMPTION_RADIUS) {
                this.consumeFood(fish, closestFood, time);
            }
            else if (fishBehavior.isHungry || fishHunger.value > 0.3) {
                this.pursueFood(fish, fishPos, foodPos, fishVel, deltaTime, fishHunger.value);
            }
        });
        this.updateEatingAnimations(deltaTime);
    }
    pursueFood(fish, fishPos, foodPos, fishVel, deltaTime, hungerLevel) {
        const behavior = fish.getMutableComponent(Behavior);
        behavior.isHungry = true;
        const dx = foodPos.x - fishPos.x;
        const dy = foodPos.y - fishPos.y;
        const dz = foodPos.z - fishPos.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
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
    consumeFood(fish, food, time) {
        const fishHunger = fish.getMutableComponent(Hunger);
        const fishBehavior = fish.getMutableComponent(Behavior);
        const fishHealth = fish.getMutableComponent(Health);
        fishHunger.value = Math.max(0, fishHunger.value - FOOD_ENERGY_VALUE);
        fishHunger.lastFed = time;
        fishBehavior.isHungry = fishHunger.value > 0.5;
        if (fishHunger.value < 0.3 && fishHealth && !fishHealth.isDead) {
            fishHealth.current = Math.min(fishHealth.max, fishHealth.current + 5);
        }
        this.startEatingAnimation(fish, time);
        food.remove();
        logger.debug(`Fish consumed food! Hunger: ${fishHunger.value.toFixed(2)}, Health: ${fishHealth?.current ?? 'N/A'}`);
    }
    startEatingAnimation(fish, time) {
        const renderable = fish.getComponent(Renderable);
        if (!renderable || !renderable.model)
            return;
        this.eatingAnimations.set(fish, {
            startTime: time,
            duration: 500,
            originalScale: renderable.model.scaling.clone(),
            fish: fish
        });
    }
    updateEatingAnimations(_deltaTime) {
        const currentTime = performance.now();
        this.eatingAnimations.forEach((animation, fish) => {
            const elapsed = currentTime - animation.startTime;
            const progress = Math.min(elapsed / animation.duration, 1.0);
            if (progress >= 1.0) {
                const renderable = fish.getComponent(Renderable);
                if (renderable && renderable.model) {
                    renderable.model.scaling.copyFrom(animation.originalScale);
                }
                this.eatingAnimations.delete(fish);
            }
            else {
                const renderable = fish.getComponent(Renderable);
                if (renderable && renderable.model) {
                    const animPhase = progress * Math.PI * 2;
                    const scaleMultiplier = 1.0 + Math.sin(animPhase) * 0.2;
                    renderable.model.scaling.x = animation.originalScale.x * scaleMultiplier;
                    renderable.model.scaling.y = animation.originalScale.y * scaleMultiplier;
                    renderable.model.scaling.z = animation.originalScale.z * scaleMultiplier;
                }
            }
        });
    }
}
FoodConsumptionSystem.queries = {
    fish: { components: [FishTag, Position, Velocity, Hunger, Behavior] }
};
//# sourceMappingURL=FoodConsumptionSystem.js.map