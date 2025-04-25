import { Position } from '../components/Position.js';
import { Velocity } from '../components/Velocity.js';
import { Renderable } from '../components/Renderable.js';
import { FoodTag } from '../components/Tags.js';

/**
 * Factory for creating food entities in the ECS system
 */
export class FoodFactory {
  /**
   * Create a food entity with all necessary components
   * @param {World} world - The ECSY world
   * @param {Object} options - Configuration options
   * @returns {Entity} The created food entity
   */
  static create(world, options = {}) {
    // Set defaults and merge with provided options
    const config = {
      position: { 
        x: (Math.random() - 0.5) * 80, // Random X position in range
        y: 30, // Start from top
        z: (Math.random() - 0.5) * 80, // Random Z position in range
        ...options.position 
      },
      velocity: { 
        x: 0, 
        y: -1 - Math.random() * 2, // Downward velocity with randomness
        z: 0, 
        maxSpeed: 3,
        ...options.velocity 
      },
      renderable: { 
        model: null, 
        scale: 0.5 + Math.random() * 0.3, // Random size
        ...options.renderable 
      }
    };
    
    // Create entity with components
    const food = world
      .createEntity()
      .addComponent(Position, config.position)
      .addComponent(Velocity, config.velocity)
      .addComponent(Renderable, config.renderable)
      .addComponent(FoodTag);
    
    return food;
  }
} 