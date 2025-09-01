import { Velocity } from '../components/Velocity.js';
import { Position } from '../components/Position.js';
import { Behavior } from '../components/Behavior.js';
import { FishTag } from '../components/Tags.js';

// WanderSystem applies a simple random walk to fish velocities
export class WanderSystem extends window.ECSY.System {
  execute(delta) {
    const dt = (delta || 0) / 1000;
    const noiseStrength = 1.2; // Increased steering strength
    const minSpeed = 0.3; // Minimum speed threshold
    
    this.queries.fish.results.forEach(entity => {
      const vel = entity.getMutableComponent(Velocity);
      const behavior = entity.getComponent(Behavior);
      
      // Calculate current speed
      const currentSpeed = Math.sqrt(vel.x*vel.x + vel.y*vel.y + vel.z*vel.z);
      
      // Initialize or boost if too slow (fish should always be moving)
      if (currentSpeed < minSpeed * vel.maxSpeed) {
        const angle = Math.random() * Math.PI * 2;
        const verticalAngle = (Math.random() - 0.5) * 0.5; // Slight vertical variation
        const speed = 0.5 + Math.random() * 0.5; // 50-100% of max speed
        
        vel.x = Math.cos(angle) * Math.cos(verticalAngle) * vel.maxSpeed * speed;
        vel.y = Math.sin(verticalAngle) * vel.maxSpeed * speed * 0.3; // Limited vertical movement
        vel.z = Math.sin(angle) * Math.cos(verticalAngle) * vel.maxSpeed * speed;
      }
      
      // Add continuous wandering behavior
      const wanderStrength = behavior?.schoolingPreference ? 
        (1.0 - behavior.schoolingPreference) * noiseStrength : noiseStrength;
      
      vel.x += (Math.random() - 0.5) * wanderStrength * dt * vel.maxSpeed;
      vel.y += (Math.random() - 0.5) * wanderStrength * dt * vel.maxSpeed * 0.2; // Less vertical wandering
      vel.z += (Math.random() - 0.5) * wanderStrength * dt * vel.maxSpeed;
      
      // Ensure fish stay in reasonable depth range (avoid surface/bottom)
      const pos = entity.getComponent(Position);
      if (pos) {
        if (pos.y > 25) vel.y -= 2 * dt; // Pull down from surface
        if (pos.y < 2) vel.y += 2 * dt;  // Pull up from bottom
      }
      
      // Clamp to max speed but maintain minimum speed
      const speedSq = vel.x*vel.x + vel.y*vel.y + vel.z*vel.z;
      const maxSq = vel.maxSpeed * vel.maxSpeed;
      
      if (speedSq > maxSq) {
        const s = vel.maxSpeed / Math.sqrt(speedSq);
        vel.x *= s; vel.y *= s; vel.z *= s;
      } else if (speedSq < (minSpeed * vel.maxSpeed) * (minSpeed * vel.maxSpeed)) {
        // Boost speed if too slow
        const s = (minSpeed * vel.maxSpeed) / Math.sqrt(speedSq);
        vel.x *= s; vel.y *= s; vel.z *= s;
      }
    });
  }
}

WanderSystem.queries = {
  fish: { components: [FishTag, Velocity, Position] }
};




