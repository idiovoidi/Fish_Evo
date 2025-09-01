import { Velocity } from '../components/Velocity.js';
import { FishTag } from '../components/Tags.js';

// WanderSystem applies a simple random walk to fish velocities
export class WanderSystem extends window.ECSY.System {
  execute(delta) {
    const dt = (delta || 0) / 1000;
    const noiseStrength = 0.5; // steering per second
    this.queries.fish.results.forEach(entity => {
      const vel = entity.getMutableComponent(Velocity);
      // Initialize if stationary
      if (vel.x === 0 && vel.y === 0 && vel.z === 0) {
        vel.x = (Math.random() - 0.5) * vel.maxSpeed;
        vel.y = (Math.random() - 0.5) * (vel.maxSpeed * 0.5);
        vel.z = (Math.random() - 0.5) * vel.maxSpeed;
      }
      // Add small random steering
      vel.x += (Math.random() - 0.5) * noiseStrength * dt * vel.maxSpeed;
      vel.y += (Math.random() - 0.5) * noiseStrength * dt * (vel.maxSpeed * 0.5);
      vel.z += (Math.random() - 0.5) * noiseStrength * dt * vel.maxSpeed;
      // Clamp speed
      const speedSq = vel.x*vel.x + vel.y*vel.y + vel.z*vel.z;
      const maxSq = vel.maxSpeed * vel.maxSpeed;
      if (speedSq > maxSq) {
        const s = vel.maxSpeed / Math.sqrt(speedSq);
        vel.x *= s; vel.y *= s; vel.z *= s;
      }
    });
  }
}

WanderSystem.queries = {
  fish: { components: [FishTag, Velocity] }
};




