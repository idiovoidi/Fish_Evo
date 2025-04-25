import { FoodFactory } from '../entities/FoodFactory.js';
import { FoodTag } from '../components/Tags.js';
import { withErrorHandler } from '../../utils/errorHandling.js';

/**
 * Food Spawner System - Periodically spawns new food in the simulation
 */
export class FoodSpawnerSystem extends window.ECSY.System {
  init() {
    this.lastSpawnTime = 0;
    this.spawnInterval = 1000; // Spawn food every 1 second
    this.spawnMinCount = 1;    // Min number of food items to spawn at once
    this.spawnMaxCount = 3;    // Max number of food items to spawn at once
    this.maxFoodCount = 50;    // Maximum number of food items in the simulation
    
    // Wrap spawn method with error handling
    this.spawnFood = withErrorHandler(this.spawnFood.bind(this), 'FoodSpawnerSystem.spawnFood');
  }
  
  /**
   * Update the spawn parameters
   * @param {Object} params - New parameters
   */
  updateConfig(params = {}) {
    this.spawnInterval = params.spawnInterval || this.spawnInterval;
    this.spawnMinCount = params.spawnMinCount || this.spawnMinCount;
    this.spawnMaxCount = params.spawnMaxCount || this.spawnMaxCount;
    this.maxFoodCount = params.maxFoodCount || this.maxFoodCount;
  }
  
  execute(delta, time) {
    // Check if it's time to spawn new food
    if (time - this.lastSpawnTime > this.spawnInterval) {
      this.lastSpawnTime = time;
      
      // Check current food count
      const currentFoodCount = this.queries.food.results.length;
      
      // Only spawn if we haven't reached the maximum
      if (currentFoodCount < this.maxFoodCount) {
        // Determine how many to spawn
        const spawnCount = Math.min(
          this.maxFoodCount - currentFoodCount,
          this.spawnMinCount + Math.floor(Math.random() * (this.spawnMaxCount - this.spawnMinCount + 1))
        );
        
        // Spawn the food
        for (let i = 0; i < spawnCount; i++) {
          this.spawnFood();
        }
      }
    }
  }
  
  /**
   * Spawn a new food entity
   */
  spawnFood() {
    // Create a new food entity using the FoodFactory
    FoodFactory.create(this.world);
  }
}

// Define queries - which entities this system should process
FoodSpawnerSystem.queries = {
  food: { components: [FoodTag] }
}; 