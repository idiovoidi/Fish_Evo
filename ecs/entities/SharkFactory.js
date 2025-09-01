import { Position } from '../components/Position.js';
import { Velocity } from '../components/Velocity.js';
import { Renderable } from '../components/Renderable.js';
import { Health } from '../components/Health.js';
import { Genetics } from '../components/Genetics.js';
import { Age } from '../components/Age.js';
import { Behavior } from '../components/Behavior.js';
import { SharkTag } from '../components/Tags.js';
import { PredatorState } from '../components/PredatorState.js';

/**
 * Factory for creating shark entities with realistic properties
 */
export class SharkFactory {
  static create(world, options = {}) {
    // Sharks have different genetics than fish - larger, faster, more aggressive
    const genetics = {
      size: 2.5 + Math.random() * 1.5,    // 2.5-4.0 (much larger than fish)
      speed: 8 + Math.random() * 6,       // 8-14 (faster than fish)
      metabolism: 0.3 + Math.random() * 0.3, // 0.3-0.6 (slower metabolism)
      color: [
        Math.floor(40 + Math.random() * 60),   // Dark grays
        Math.floor(40 + Math.random() * 60),   // Dark grays  
        Math.floor(50 + Math.random() * 80)    // Slightly blue-tinted
      ],
      ...options.genetics
    };
    
    // Create initial velocity for hunting behavior
    const angle = Math.random() * Math.PI * 2;
    const initialSpeed = 0.2 + Math.random() * 0.3; // 20-50% of max speed
    
    const config = {
      position: {
        x: (Math.random()-0.5)*80,
        y: 12 + Math.random() * 8, // Prefer deeper water
        z: (Math.random()-0.5)*80,
        ...options.position
      },
      velocity: {
        x: Math.cos(angle) * genetics.speed * initialSpeed,
        y: (Math.random() - 0.5) * genetics.speed * initialSpeed * 0.3,
        z: Math.sin(angle) * genetics.speed * initialSpeed,
        maxSpeed: genetics.speed,
        ...options.velocity
      },
      health: { 
        current: 300, 
        max: 300, 
        regenRate: 0.2,  // Sharks regenerate health slowly
        isDead: false,
        ...options.health 
      },
      age: {
        value: 0,
        maturityAge: 180,  // Mature slower than fish
        maxAge: 1200,      // Live much longer
        ...options.age
      },
      behavior: {
        isHungry: true,        // Sharks are usually hunting
        isFleeing: false,
        isSchooling: false,    // Sharks don't school
        isResting: false,
        isMating: false,
        schoolingPreference: 0.0, // No schooling behavior
        personalSpace: 5.0,    // Large personal space
        aggressionLevel: 0.8 + Math.random() * 0.2, // High aggression
        huntingRadius: 15.0,   // Can detect prey from far away
        ...options.behavior
      },
      renderable: { 
        model: null, 
        scale: genetics.size,
        ...options.renderable 
      },
      predatorState: { 
        lastBiteTime: 0, 
        biteCooldown: 1500,    // Faster attack rate
        huntingTarget: null,   // Current prey target
        chaseSpeed: genetics.speed * 1.2, // Can boost speed when chasing
        ...options.predatorState 
      },
      genetics: genetics
    };

    const shark = world.createEntity()
      .addComponent(Position, config.position)
      .addComponent(Velocity, config.velocity)
      .addComponent(Health, config.health)
      .addComponent(Age, config.age)
      .addComponent(Behavior, config.behavior)
      .addComponent(Renderable, config.renderable)
      .addComponent(PredatorState, config.predatorState)
      .addComponent(Genetics, config.genetics)
      .addComponent(SharkTag);
      
    return shark;
  }
} 