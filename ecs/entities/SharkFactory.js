import { Position } from '../components/Position.js';
import { Velocity } from '../components/Velocity.js';
import { Renderable } from '../components/Renderable.js';
import { Health } from '../components/Health.js';
import { SharkTag } from '../components/Tags.js';
import { PredatorState } from '../components/PredatorState.js';

export class SharkFactory {
  static create(world, options = {}) {
    const config = {
      position: {
        x: (Math.random()-0.5)*80,
        y: 10 + Math.random()*10,
        z: (Math.random()-0.5)*80,
        ...options.position
      },
      velocity: {
        x: 0, y:0, z:0, maxSpeed: 10,
        ...options.velocity
      },
      health: { current:200, max:200, regenRate:0, ...options.health },
      renderable: { model:null, scale:2, ...options.renderable },
      predatorState: { lastBiteTime:0, biteCooldown:2000, ...options.predatorState }
    };

    const shark = world.createEntity()
      .addComponent(Position, config.position)
      .addComponent(Velocity, config.velocity)
      .addComponent(Health, config.health)
      .addComponent(Renderable, config.renderable)
      .addComponent(PredatorState, config.predatorState)
      .addComponent(SharkTag);
    return shark;
  }
} 