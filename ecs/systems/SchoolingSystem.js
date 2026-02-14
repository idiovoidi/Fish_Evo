import { Position } from '../components/Position.js';
import { Velocity } from '../components/Velocity.js';
import { Behavior } from '../components/Behavior.js';
import { Hunger } from '../components/Hunger.js';
import { FishTag } from '../components/Tags.js';
import { SpatialHashSystem } from './SpatialHashSystem.js';
import { clampVelocity } from '../../utils/velocity.js';

// Advanced schooling system implementing boids algorithm: cohesion + separation + alignment
export class SchoolingSystem extends window.ECSY.System {
  init() {
    this.spatial = this.world.getSystem(SpatialHashSystem);
    this.neighborRadius = 8;         // Detection radius
    this.separationDistance = 2.5;   // Personal space radius  
    this.cohesionRadius = 6;         // Grouping radius
    this.alignmentRadius = 4;        // Velocity matching radius
  }

  execute(delta) {
    const dt = (delta || 0) / 1000;
    const neighborRadius = this.neighborRadius;
    const sepRadius = this.separationDistance;
    const cohRadius = this.cohesionRadius;
    const alignRadius = this.alignmentRadius;
    
    this.queries.fish.results.forEach(entity => {
      const pos = entity.getComponent(Position);
      const vel = entity.getMutableComponent(Velocity);
      const beh = entity.getComponent(Behavior);
      
      if (!pos || !vel) return;

      const neighbors = this.spatial.getEntitiesNear(pos, neighborRadius, FishTag);
      if (!neighbors || neighbors.length <= 1) return; // Need at least one other fish

      // Schooling preference affects how much fish follow boids rules
      // Hungry fish are less social and more individualistic
      const hunger = entity.getComponent(Hunger);
      const hungerPenalty = hunger ? Math.min(hunger.value * 0.7, 0.6) : 0; // Up to 60% reduction
      const schoolPref = Math.max(0.2, (beh?.schoolingPreference ?? 0.8) - hungerPenalty);
      const personalSpace = beh?.personalSpace ?? 1.0;
      
      let separationCount = 0, cohesionCount = 0, alignmentCount = 0;
      const separation = { x: 0, y: 0, z: 0 };
      const cohesion = { x: 0, y: 0, z: 0 };
      const alignment = { x: 0, y: 0, z: 0 };
      
      neighbors.forEach(neighbor => {
        if (neighbor === entity) return;
        
        const neighborPos = neighbor.getComponent(Position);
        const neighborVel = neighbor.getComponent(Velocity);
        if (!neighborPos) return;
        
        const dx = pos.x - neighborPos.x;
        const dy = pos.y - neighborPos.y;
        const dz = pos.z - neighborPos.z;
        const distSq = dx*dx + dy*dy + dz*dz;
        const dist = Math.sqrt(distSq);
        
        // SEPARATION: Avoid crowding neighbors
        if (dist > 0 && dist < sepRadius * personalSpace) {
          const weight = (sepRadius * personalSpace - dist) / (sepRadius * personalSpace);
          separation.x += (dx / dist) * weight;
          separation.y += (dy / dist) * weight;
          separation.z += (dz / dist) * weight;
          separationCount++;
        }
        
        // COHESION: Move toward average position of neighbors
        if (dist < cohRadius) {
          cohesion.x += neighborPos.x;
          cohesion.y += neighborPos.y;
          cohesion.z += neighborPos.z;
          cohesionCount++;
        }
        
        // ALIGNMENT: Match velocity of nearby neighbors
        if (dist < alignRadius && neighborVel) {
          alignment.x += neighborVel.x;
          alignment.y += neighborVel.y;
          alignment.z += neighborVel.z;
          alignmentCount++;
        }
      });
      
      // Calculate steering forces
      const steer = { x: 0, y: 0, z: 0 };
      
      // Apply separation (highest priority)
      if (separationCount > 0) {
        const sepWeight = 2.5 * schoolPref;
        steer.x += separation.x * sepWeight;
        steer.y += separation.y * sepWeight * 0.5; // Reduce vertical separation
        steer.z += separation.z * sepWeight;
      }
      
      // Apply cohesion (medium priority)
      if (cohesionCount > 0) {
        cohesion.x = (cohesion.x / cohesionCount) - pos.x; // Direction to center
        cohesion.y = (cohesion.y / cohesionCount) - pos.y;
        cohesion.z = (cohesion.z / cohesionCount) - pos.z;
        
        const cohWeight = 1.0 * schoolPref;
        steer.x += cohesion.x * cohWeight;
        steer.y += cohesion.y * cohWeight * 0.3; // Reduce vertical cohesion
        steer.z += cohesion.z * cohWeight;
      }
      
      // Apply alignment (lower priority)
      if (alignmentCount > 0) {
        alignment.x = (alignment.x / alignmentCount) - vel.x; // Desired velocity change
        alignment.y = (alignment.y / alignmentCount) - vel.y;
        alignment.z = (alignment.z / alignmentCount) - vel.z;
        
        const alignWeight = 0.8 * schoolPref;
        steer.x += alignment.x * alignWeight;
        steer.y += alignment.y * alignWeight;
        steer.z += alignment.z * alignWeight;
      }
      
      // Apply steering with time-based integration
      vel.x += steer.x * dt;
      vel.y += steer.y * dt;
      vel.z += steer.z * dt;
      clampVelocity(vel, { minSpeedFactor: 0.3 });
    });
  }
}

SchoolingSystem.queries = { fish: { components: [FishTag, Position, Velocity] } };








