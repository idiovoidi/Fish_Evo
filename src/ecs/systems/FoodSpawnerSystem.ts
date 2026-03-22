import { FoodFactory } from '../entities/FoodFactory';
import { FoodTag } from '../components/Tags';
import { withErrorHandler } from '../../utils/errorHandling';

export class FoodSpawnerSystem extends (window as any).ECSY.System {
  lastSpawnTime: number = 0;
  spawnInterval: number = 1000;
  spawnMinCount: number = 1;
  spawnMaxCount: number = 3;
  maxFoodCount: number = 50;

  init() {
    this.lastSpawnTime = 0;
    this.spawnInterval = 1000;
    this.spawnMinCount = 1;
    this.spawnMaxCount = 3;
    this.maxFoodCount = 50;
    
    (this as any).spawnFood = withErrorHandler(this.spawnFood.bind(this), 'FoodSpawnerSystem.spawnFood');
  }
  
  updateConfig(params: any = {}) {
    this.spawnInterval = params.spawnInterval || this.spawnInterval;
    this.spawnMinCount = params.spawnMinCount || this.spawnMinCount;
    this.spawnMaxCount = params.spawnMaxCount || this.spawnMaxCount;
    this.maxFoodCount = params.maxFoodCount || this.maxFoodCount;
  }
  
  execute(_delta: number, time: number) {
    if (time - this.lastSpawnTime > this.spawnInterval) {
      this.lastSpawnTime = time;
      
      const currentFoodCount = this.queries.food.results.length;
      
      if (currentFoodCount < this.maxFoodCount) {
        const spawnCount = Math.min(
          this.maxFoodCount - currentFoodCount,
          this.spawnMinCount + Math.floor(Math.random() * (this.spawnMaxCount - this.spawnMinCount + 1))
        );
        
        for (let i = 0; i < spawnCount; i++) {
          (this as any).spawnFood();
        }
      }
    }
  }
  
  spawnFood() {
    FoodFactory.create(this.world);
  }
}

(FoodSpawnerSystem as any).queries = {
  food: { components: [FoodTag] }
};
