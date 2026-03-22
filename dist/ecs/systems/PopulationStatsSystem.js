import { FishTag, FoodTag, SharkTag } from '../components/Tags';
import { Health } from '../components/Health';
import { Hunger } from '../components/Hunger';
import { Age } from '../components/Age';
import { logger } from '../../utils/logger';
export class PopulationStatsSystem extends window.ECSY.System {
    constructor() {
        super(...arguments);
        this.lastLogTime = 0;
        this.logInterval = 10000;
        this.birthCount = 0;
        this.deathCount = 0;
        this.startTime = 0;
    }
    init() {
        this.lastLogTime = 0;
        this.logInterval = 10000;
        this.birthCount = 0;
        this.deathCount = 0;
        this.startTime = performance.now();
    }
    execute(_delta, time) {
        if (time - this.lastLogTime < this.logInterval) {
            return;
        }
        this.lastLogTime = time;
        const fishCount = this.queries.fish.results.length;
        const foodCount = this.queries.food.results.length;
        const sharkCount = this.queries.sharks.results.length;
        let totalHunger = 0;
        let totalHealth = 0;
        let adultCount = 0;
        let starvingCount = 0;
        this.queries.fish.results.forEach((fish) => {
            const hunger = fish.getComponent(Hunger);
            const health = fish.getComponent(Health);
            const age = fish.getComponent(Age);
            if (hunger) {
                totalHunger += hunger.value;
                if (hunger.value > 0.8)
                    starvingCount++;
            }
            if (health)
                totalHealth += health.current;
            if (age && age.isAdult)
                adultCount++;
        });
        const avgHunger = fishCount > 0 ? (totalHunger / fishCount) : 0;
        const avgHealth = fishCount > 0 ? (totalHealth / fishCount) : 0;
        const elapsedMinutes = ((time - this.startTime) / 60000).toFixed(1);
        logger.debug(`
╔════════════════════════════════════════════════════════════╕
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
//# sourceMappingURL=PopulationStatsSystem.js.map