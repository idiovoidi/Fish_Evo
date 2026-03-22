import { Position } from '../components/Position';
import { Velocity } from '../components/Velocity';
import { Behavior } from '../components/Behavior';
import { Hunger } from '../components/Hunger';
import { FishTag } from '../components/Tags';
import { clampVelocity } from '../../utils/velocity';
export class SchoolingSystem extends window.ECSY.System {
    constructor() {
        super(...arguments);
        this.neighborRadius = 8;
        this.separationDistance = 2.5;
        this.cohesionRadius = 6;
        this.alignmentRadius = 4;
    }
    init() {
        this.spatial = this.world.getSystem('SpatialHashSystem');
        this.neighborRadius = 8;
        this.separationDistance = 2.5;
        this.cohesionRadius = 6;
        this.alignmentRadius = 4;
    }
    execute(delta) {
        const dt = (delta || 0) / 1000;
        const neighborRadius = this.neighborRadius;
        const sepRadius = this.separationDistance;
        const cohRadius = this.cohesionRadius;
        const alignRadius = this.alignmentRadius;
        this.queries.fish.results.forEach((entity) => {
            const pos = entity.getComponent(Position);
            const vel = entity.getMutableComponent(Velocity);
            const beh = entity.getComponent(Behavior);
            if (!pos || !vel)
                return;
            const neighbors = this.spatial.getEntitiesNear(pos, neighborRadius, FishTag);
            if (!neighbors || neighbors.length <= 1)
                return;
            const hunger = entity.getComponent(Hunger);
            const hungerPenalty = hunger ? Math.min(hunger.value * 0.7, 0.6) : 0;
            const schoolPref = Math.max(0.2, (beh?.schoolingPreference ?? 0.8) - hungerPenalty);
            const personalSpace = beh?.personalSpace ?? 1.0;
            let separationCount = 0, cohesionCount = 0, alignmentCount = 0;
            const separation = { x: 0, y: 0, z: 0 };
            const cohesion = { x: 0, y: 0, z: 0 };
            const alignment = { x: 0, y: 0, z: 0 };
            neighbors.forEach((neighbor) => {
                if (neighbor === entity)
                    return;
                const neighborPos = neighbor.getComponent(Position);
                const neighborVel = neighbor.getComponent(Velocity);
                if (!neighborPos)
                    return;
                const dx = pos.x - neighborPos.x;
                const dy = pos.y - neighborPos.y;
                const dz = pos.z - neighborPos.z;
                const distSq = dx * dx + dy * dy + dz * dz;
                const dist = Math.sqrt(distSq);
                if (dist > 0 && dist < sepRadius * personalSpace) {
                    const weight = (sepRadius * personalSpace - dist) / (sepRadius * personalSpace);
                    separation.x += (dx / dist) * weight;
                    separation.y += (dy / dist) * weight;
                    separation.z += (dz / dist) * weight;
                    separationCount++;
                }
                if (dist < cohRadius) {
                    cohesion.x += neighborPos.x;
                    cohesion.y += neighborPos.y;
                    cohesion.z += neighborPos.z;
                    cohesionCount++;
                }
                if (dist < alignRadius && neighborVel) {
                    alignment.x += neighborVel.x;
                    alignment.y += neighborVel.y;
                    alignment.z += neighborVel.z;
                    alignmentCount++;
                }
            });
            const steer = { x: 0, y: 0, z: 0 };
            if (separationCount > 0) {
                const sepWeight = 2.5 * schoolPref;
                steer.x += separation.x * sepWeight;
                steer.y += separation.y * sepWeight * 0.5;
                steer.z += separation.z * sepWeight;
            }
            if (cohesionCount > 0) {
                cohesion.x = (cohesion.x / cohesionCount) - pos.x;
                cohesion.y = (cohesion.y / cohesionCount) - pos.y;
                cohesion.z = (cohesion.z / cohesionCount) - pos.z;
                const cohWeight = 1.0 * schoolPref;
                steer.x += cohesion.x * cohWeight;
                steer.y += cohesion.y * cohWeight * 0.3;
                steer.z += cohesion.z * cohWeight;
            }
            if (alignmentCount > 0) {
                alignment.x = (alignment.x / alignmentCount) - vel.x;
                alignment.y = (alignment.y / alignmentCount) - vel.y;
                alignment.z = (alignment.z / alignmentCount) - vel.z;
                const alignWeight = 0.8 * schoolPref;
                steer.x += alignment.x * alignWeight;
                steer.y += alignment.y * alignWeight;
                steer.z += alignment.z * alignWeight;
            }
            vel.x += steer.x * dt;
            vel.y += steer.y * dt;
            vel.z += steer.z * dt;
            clampVelocity(vel, { minSpeedFactor: 0.3 });
        });
    }
}
SchoolingSystem.queries = { fish: { components: [FishTag, Position, Velocity] } };
//# sourceMappingURL=SchoolingSystem.js.map