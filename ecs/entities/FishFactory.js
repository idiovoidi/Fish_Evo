import { Position } from '../components/Position.js';
import { Velocity } from '../components/Velocity.js';
import { Renderable } from '../components/Renderable.js';
import { Health } from '../components/Health.js';
import { Age } from '../components/Age.js';
import { Hunger } from '../components/Hunger.js';
import { Behavior } from '../components/Behavior.js';
import { FishTag } from '../components/Tags.js';
import { Genetics } from '../components/Genetics.js';

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
    // Generate genetics first to determine derived properties
    const genetics = {
      size: 0.8 + Math.random() * 0.8, // 0.8–1.6
      speed: 4 + Math.random() * 4,    // 4–8
      metabolism: 0.8 + Math.random() * 0.4, // 0.8–1.2
      color: [
        Math.floor(80 + Math.random() * 120),
        Math.floor(120 + Math.random() * 120),
        Math.floor(150 + Math.random() * 105)
      ],
      ...options.genetics
    };
    
    // Create initial velocity that's directional and realistic
    const angle = Math.random() * Math.PI * 2; // Random horizontal direction
    const verticalAngle = (Math.random() - 0.5) * 0.3; // Slight vertical angle
    const initialSpeed = 0.4 + Math.random() * 0.4; // 40-80% of max speed
    
    const initialVelocity = {
      x: Math.cos(angle) * Math.cos(verticalAngle) * genetics.speed * initialSpeed,
      y: Math.sin(verticalAngle) * genetics.speed * initialSpeed * 0.5, // Reduced vertical component
      z: Math.sin(angle) * Math.cos(verticalAngle) * genetics.speed * initialSpeed,
      maxSpeed: genetics.speed,
      ...options.velocity
    };
    
    // Set defaults and merge with provided options
    const config = {
      position: { x: 0, y: 10, z: 0, ...options.position },
      velocity: initialVelocity,
      health: { current: 100, max: 100, regenRate: 0.1, isDead: false, ...options.health },
      age: { value: 0, maturityAge: 60, maxAge: 300, ...options.age },
      hunger: { 
        value: 0.4 + Math.random() * 0.3, // Start with moderate hunger (0.4-0.7)
        rate: 0.012 + Math.random() * 0.008, // 0.012-0.020 per second
        ...options.hunger 
      },
      behavior: { 
        schoolingPreference: 0.6 + Math.random() * 0.4, // 0.6-1.0 range
        personalSpace: 1 + Math.random() * 0.8, // 1.0-1.8 range
        isHungry: false,
        isFleeing: false,
        isSchooling: true, // Start in schooling mode
        isResting: false,
        isMating: false,
        lastBreedTime: 0,
        breedCooldown: 30000,
        ...options.behavior 
      },
      renderable: { 
        model: null, 
        scale: genetics.size,
        ...options.renderable 
      },
      genetics: genetics
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
      .addComponent(FishTag)
      .addComponent(Genetics, config.genetics);

    return fish;
  }
} 