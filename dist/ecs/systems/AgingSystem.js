import { Age } from '../components/Age';
import { Health } from '../components/Health';
export class AgingSystem extends window.ECSY.System {
    execute(delta, _time) {
        const deltaTime = delta / 1000;
        this.queries.aging.results.forEach((entity) => {
            const age = entity.getMutableComponent(Age);
            const health = entity.getMutableComponent(Health);
            age.value += deltaTime;
            if (!age.isAdult && age.value >= age.maturityAge) {
                age.isAdult = true;
                console.log(`Fish reached maturity at age ${age.value.toFixed(1)} seconds`);
            }
            if (health && !health.isDead) {
                const oldAgeThreshold = age.maxAge * 0.8;
                if (age.value > oldAgeThreshold) {
                    const ageProgress = (age.value - oldAgeThreshold) / (age.maxAge - oldAgeThreshold);
                    const agingDamage = ageProgress * 2 * deltaTime;
                    health.current = Math.max(0, health.current - agingDamage);
                    if (health.current <= 0) {
                        health.isDead = true;
                        console.log(`Fish died of old age at ${age.value.toFixed(1)} seconds`);
                    }
                }
                if (age.value >= age.maxAge) {
                    health.isDead = true;
                    health.current = 0;
                    console.log(`Fish died of natural causes at maximum age of ${age.maxAge} seconds`);
                }
            }
        });
    }
}
AgingSystem.queries = {
    aging: { components: [Age] }
};
//# sourceMappingURL=AgingSystem.js.map