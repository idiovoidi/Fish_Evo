import { Position } from '../components/Position.js';
import { Velocity } from '../components/Velocity.js';
import { Renderable } from '../components/Renderable.js';
import { Health } from '../components/Health.js';
import { Age } from '../components/Age.js';
import { Hunger } from '../components/Hunger.js';
import { Behavior } from '../components/Behavior.js';
import { FishTag } from '../components/Tags.js';

/**
 * Factory for creating fish entities in the ECS system
 */
export class FishFactory {
  /**
   * Create a fish entity with all necessary components
   * @param {World} world - The ECSY world
   * @param {Object} options - Configuration options
   * @returns {Entity} The created fish entity
   */
  static create(world, options = {}) {
    // Set defaults and merge with provided options
    const config = {
      position: { x: 0, y: 10, z: 0, ...options.position },
      velocity: { x: 0, y: 0, z: 0, maxSpeed: 8, ...options.velocity },
      health: { current: 100, max: 100, regenRate: 0.1, ...options.health },
      age: { value: 0, maturityAge: 60, maxAge: 300, ...options.age },
      hunger: { value: 0.2, rate: 0.02, ...options.hunger },
      behavior: { 
        schoolingPreference: 0.8 + Math.random() * 0.4,
        personalSpace: 1 + Math.random() * 0.5,
        ...options.behavior 
      },
      renderable: { model: null, scale: 1, ...options.renderable }
    };
    
    // Create entity with components
    const fish = world
      .createEntity()
      .addComponent(Position, config.position)
      .addComponent(Velocity, config.velocity)
      .addComponent(Health, config.health)
      .addComponent(Age, config.age)
      .addComponent(Hunger, config.hunger)
      .addComponent(Behavior, config.behavior)
      .addComponent(Renderable, config.renderable)
      .addComponent(FishTag);
    
    return fish;
  }
} 