import { Velocity } from '../components/Velocity';
import { Position } from '../components/Position';
import { Behavior } from '../components/Behavior';
import { FishTag } from '../components/Tags';
import { clampVelocity } from '../../utils/velocity';
export class WanderSystem extends window.ECSY.System {
    execute(delta) {
        const dt = (delta || 0) / 1000;
        const noiseStrength = 1.2;
        const minSpeed = 0.3;
        this.queries.fish.results.forEach((entity) => {
            const vel = entity.getMutableComponent(Velocity);
            const behavior = entity.getComponent(Behavior);
            const currentSpeed = Math.sqrt(vel.x * vel.x + vel.y * vel.y + vel.z * vel.z);
            if (currentSpeed < minSpeed * vel.maxSpeed) {
                const angle = Math.random() * Math.PI * 2;
                const verticalAngle = (Math.random() - 0.5) * 0.5;
                const speed = 0.5 + Math.random() * 0.5;
                vel.x = Math.cos(angle) * Math.cos(verticalAngle) * vel.maxSpeed * speed;
                vel.y = Math.sin(verticalAngle) * vel.maxSpeed * speed * 0.3;
                vel.z = Math.sin(angle) * Math.cos(verticalAngle) * vel.maxSpeed * speed;
            }
            const wanderStrength = behavior?.schoolingPreference ?
                (1.0 - behavior.schoolingPreference) * noiseStrength : noiseStrength;
            vel.x += (Math.random() - 0.5) * wanderStrength * dt * vel.maxSpeed;
            vel.y += (Math.random() - 0.5) * wanderStrength * dt * vel.maxSpeed * 0.2;
            vel.z += (Math.random() - 0.5) * wanderStrength * dt * vel.maxSpeed;
            const pos = entity.getComponent(Position);
            if (pos) {
                if (pos.y > 25)
                    vel.y -= 2 * dt;
                if (pos.y < 2)
                    vel.y += 2 * dt;
            }
            clampVelocity(vel, { minSpeedFactor: minSpeed });
        });
    }
}
WanderSystem.queries = {
    fish: { components: [FishTag, Velocity, Position] }
};
//# sourceMappingURL=WanderSystem.js.map