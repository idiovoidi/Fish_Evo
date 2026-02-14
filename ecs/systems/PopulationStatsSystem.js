import { FishTag, FoodTag, SharkTag } from '../components/Tags.js';
import { Health } from '../components/Health.js';
import { Hunger } from '../components/Hunger.js';
import { Age } from '../components/Age.js';

/**
 * Population Stats System - Tracks and logs population statistics
 */
export class PopulationStatsSystem extends window.ECSY.System {
  init() {
    this.lastLogTime = 0;
    this.logInterval = 10000; // Log every 10 seconds
    this.birthCount = 0;
    this.deathCount = 0;
    this.startTime = performance.now();
  }

  execute(delta, time) {
    // Only log periodically
    if (time - this.lastLogTime < this.logInterval) {
      return;
    }
    
    this.lastLogTime = time;
    
    // Count populations
    const fishCount = this.queries.fish.results.length;
    const foodCount = this.queries.food.results.length;
    const sharkCount = this.queries.sharks.results.length;
    
    // Calculate fish statistics
    let totalHunger = 0;
    let totalHealth = 0;
    let adultCount = 0;
    let starvingCount = 0;
    
    this.queries.fish.results.forEach(fish => {
      const hunger = fish.getComponent(Hunger);
      const health = fish.getComponent(Health);
      const age = fish.getComponent(Age);
      
      if (hunger) {
        totalHunger += hunger.value;
        if (hunger.value > 0.8) starvingCount++;
      }
      if (health) totalHealth += health.current;
      if (age && age.isAdult) adultCount++;
    });
    
    const avgHunger = fishCount > 0 ? (totalHunger / fishCount) : 0;
    const avgHealth = fishCount > 0 ? (totalHealth / fishCount) : 0;
    
    // Log statistics
    const elapsedMinutes = ((time - this.startTime) / 60000).toFixed(1);
    console.log(`
╔════════════════════════════════════════════════════════════╗
║ POPULATION STATS (${elapsedMinutes} min)                              
╠════════════════════════════════════════════════════════════╣
║ Fish:     ${fishCount.toString().padStart(3)} (${adultCount} adults, ${starvingCount} starving)
║ Food:     ${foodCount.toString().padStart(3)}
║ Sharks:   ${sharkCount.toString().padStart(3)}
║ Avg Hunger: ${(avgHunger * 100).toFixed(1)}%
║ Avg Health: ${avgHealth.toFixed(1)}
╚════════════════════════════════════════════════════════════╝
    `);
  }
}

PopulationStatsSystem.queries = {
  fish: { components: [FishTag] },
  food: { components: [FoodTag] },
  sharks: { components: [SharkTag] }
};
