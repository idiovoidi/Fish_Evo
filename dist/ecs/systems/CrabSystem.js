import { Position } from '../components/Position';
import { Velocity } from '../components/Velocity';
import { Behavior } from '../components/Behavior';
import { CrabTag } from '../components/Tags';
export class CrabSystem extends window.ECSY.System {
    execute(delta, time) {
        const dt = delta / 1000;
        this.queries.crabs.results.forEach((entity) => {
            const position = entity.getMutableComponent(Position);
            const velocity = entity.getMutableComponent(Velocity);
            const behavior = entity.getMutableComponent(Behavior);
            if (!position || !velocity || !behavior)
                return;
            behavior.waitTime = Math.max(0, (behavior.waitTime || 0) - dt);
            if (behavior.isResting) {
                if (behavior.waitTime <= 0) {
                    behavior.isResting = false;
                    behavior.waitDuration = 3 + Math.random() * 2;
                    behavior.lastStateChange = time;
                }
                else {
                    velocity.x = 0;
                    velocity.y = 0;
                    velocity.z = 0;
                    return;
                }
            }
            if (typeof window !== 'undefined' && window.landscape) {
                const terrainHeight = window.landscape.getHeightAtPoint(position.x, position.z);
                const targetY = terrainHeight + (window.SimulationConfig?.entities?.crabs?.spawnHeight || 0.1);
                position.y = targetY;
            }
            const wanderStrength = 1.0;
            const maxSpeed = velocity.maxSpeed || 2;
            velocity.x += (Math.random() - 0.5) * wanderStrength * dt * maxSpeed;
            velocity.z += (Math.random() - 0.5) * wanderStrength * dt * maxSpeed;
            const TERRAIN_SIZE = 90;
            const BOUND_MARGIN = 5;
            const halfSize = TERRAIN_SIZE / 2 - BOUND_MARGIN;
            if (Math.abs(position.x) > halfSize || Math.abs(position.z) > halfSize) {
                const centerForce = 3.0;
                velocity.x += -Math.sign(position.x) * centerForce * dt;
                velocity.z += -Math.sign(position.z) * centerForce * dt;
            }
            this.applySeparation(entity, position, velocity, behavior, dt);
            const speedSq = velocity.x * velocity.x + velocity.z * velocity.z;
            const maxSpeedSq = maxSpeed * maxSpeed;
            if (speedSq > maxSpeedSq) {
                const scale = maxSpeed / Math.sqrt(speedSq);
                velocity.x *= scale;
                velocity.z *= scale;
            }
            if (!behavior.isResting && Math.random() < 0.05 * dt) {
                behavior.isResting = true;
                behavior.waitTime = behavior.waitDuration;
                velocity.x = 0;
                velocity.z = 0;
            }
        });
    }
    applySeparation(entity, position, velocity, behavior, dt) {
        const separationRadius = behavior.personalSpace || 2.0;
        const separationForce = 2.0;
        let separationX = 0;
        let separationZ = 0;
        let nearbyCount = 0;
        this.queries.crabs.results.forEach((other) => {
            if (other === entity)
                return;
            const otherPos = other.getComponent(Position);
            if (!otherPos)
                return;
            const dx = position.x - otherPos.x;
            const dz = position.z - otherPos.z;
            const distSq = dx * dx + dz * dz;
            if (distSq < separationRadius * separationRadius && distSq > 0) {
                const dist = Math.sqrt(distSq);
                const weight = (separationRadius - dist) / separationRadius;
                separationX += (dx / dist) * weight;
                separationZ += (dz / dist) * weight;
                nearbyCount++;
            }
        });
        if (nearbyCount > 0) {
            velocity.x += separationX * separationForce * dt;
            velocity.z += separationZ * separationForce * dt;
        }
    }
}
CrabSystem.queries = {
    crabs: { components: [CrabTag, Position, Velocity, Behavior] }
};
//# sourceMappingURL=CrabSystem.js.map