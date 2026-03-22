import { Position } from '../components/Position';
import { Velocity } from '../components/Velocity';
import { Renderable } from '../components/Renderable';
import { Health } from '../components/Health';
import { Genetics } from '../components/Genetics';
import { Age } from '../components/Age';
import { Behavior } from '../components/Behavior';
import { SharkTag } from '../components/Tags';
import { PredatorState } from '../components/PredatorState';

interface SharkOptions {
  position?: { x?: number; y?: number; z?: number };
  velocity?: { x?: number; y?: number; z?: number; maxSpeed?: number };
  health?: { current?: number; max?: number; regenRate?: number; isDead?: boolean };
  age?: { value?: number; maturityAge?: number; maxAge?: number };
  behavior?: { isHungry?: boolean; isFleeing?: boolean; isSchooling?: boolean; isResting?: boolean; isMating?: boolean; schoolingPreference?: number; personalSpace?: number; aggressionLevel?: number; huntingRadius?: number };
  renderable?: { model?: any; scale?: number; visible?: boolean };
  predatorState?: { lastBiteTime?: number; biteCooldown?: number; huntingTarget?: any; chaseSpeed?: number };
  genetics?: { size?: number; speed?: number; metabolism?: number; color?: number[] };
}

export class SharkFactory {
  static create(world: any, options: SharkOptions = {}) {
    const genetics = {
      size: 2.5 + Math.random() * 1.5,
      speed: 8 + Math.random() * 6,
      metabolism: 0.3 + Math.random() * 0.3,
      color: [
        Math.floor(40 + Math.random() * 60),
        Math.floor(40 + Math.random() * 60),
        Math.floor(50 + Math.random() * 80)
      ],
      ...options.genetics
    };
    
    const angle = Math.random() * Math.PI * 2;
    const initialSpeed = 0.2 + Math.random() * 0.3;
    
    const config = {
      position: {
        x: (Math.random()-0.5)*80,
        y: 12 + Math.random() * 8,
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
        regenRate: 0.2,
        isDead: false,
        ...options.health 
      },
      age: {
        value: 0,
        maturityAge: 180,
        maxAge: 1200,
        ...options.age
      },
      behavior: {
        isHungry: true,
        isFleeing: false,
        isSchooling: false,
        isResting: false,
        isMating: false,
        schoolingPreference: 0.0,
        personalSpace: 5.0,
        aggressionLevel: 0.8 + Math.random() * 0.2,
        huntingRadius: 15.0,
        ...options.behavior
      },
      renderable: { 
        model: null, 
        scale: genetics.size,
        ...options.renderable 
      },
      predatorState: { 
        lastBiteTime: 0, 
        biteCooldown: 1500,
        huntingTarget: null,
        chaseSpeed: genetics.speed * 1.2,
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
