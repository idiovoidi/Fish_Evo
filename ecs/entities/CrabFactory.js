import { Position } from '../components/Position.js';
import { Velocity } from '../components/Velocity.js';
import { Renderable } from '../components/Renderable.js';
import { Health } from '../components/Health.js';
import { Age } from '../components/Age.js';
import { Behavior } from '../components/Behavior.js';
import { CrabTag } from '../components/Tags.js';

/**
 * Factory for creating crab entities in the ECS system
 */
export class CrabFactory {
  /**
   * Create a crab entity with all necessary components
   * @param {World} world - The ECSY world
   * @param {Object} options - Configuration options
   * @returns {Entity} The created crab entity
   */
  static create(world, options = {}) {
    // Set defaults and merge with provided options
    const config = {
      position: { 
        x: (Math.random() - 0.5) * 80, // Random X position in range
        y: 0, // Will be adjusted to terrain height by CrabSystem
        z: (Math.random() - 0.5) * 80, // Random Z position in range
        ...options.position 
      },
      velocity: { 
        x: 0, 
        y: 0, 
        z: 0, 
        maxSpeed: window.SimulationConfig?.entities?.crabs?.maxSpeed || 2,
        ...options.velocity 
      },
      health: { 
        current: 100, 
        max: 100, 
        regenRate: 0.1,
        isDead: false,
        ...options.health 
      },
      age: {
        value: 0,
        maturityAge: 120, // Mature at 2 minutes
        maxAge: 600,     // Live for 10 minutes
        isAdult: false,
        ...options.age
      },
      behavior: { 
        schoolingPreference: 0.0, // Crabs don't school
        personalSpace: 2.0,       // Need space between crabs
        isHungry: false,
        isFleeing: false,
        isSchooling: false,
        isResting: Math.random() > 0.7, // 30% chance to start resting
        isMating: false,
        waitTime: 0,
        waitDuration: 3 + Math.random() * 2, // 3-5 seconds
        lastStateChange: 0,
        ...options.behavior 
      },
      renderable: { 
        model: null, 
        scale: 0.8 + Math.random() * 0.4, // Random size variation 0.8-1.2
        visible: true,
        ...options.renderable 
      }
    };
    
    // Create entity with components
    const crab = world
      .createEntity()
      .addComponent(Position, config.position)
      .addComponent(Velocity, config.velocity)
      .addComponent(Health, config.health)
      .addComponent(Age, config.age)
      .addComponent(Behavior, config.behavior)
      .addComponent(Renderable, config.renderable)
      .addComponent(CrabTag);
    
    return crab;
  }
}