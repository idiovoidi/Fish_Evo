import { Position } from '../components/Position';
import { Velocity } from '../components/Velocity';
import { Renderable } from '../components/Renderable';
import { Health } from '../components/Health';
import { Age } from '../components/Age';
import { Hunger } from '../components/Hunger';
import { Behavior } from '../components/Behavior';
import { FishTag } from '../components/Tags';
import { Genetics } from '../components/Genetics';

interface FishOptions {
  position?: { x?: number; y?: number; z?: number };
  velocity?: { x?: number; y?: number; z?: number; maxSpeed?: number };
  health?: { current?: number; max?: number; regenRate?: number; isDead?: boolean };
  age?: { value?: number; maturityAge?: number; maxAge?: number; isAdult?: boolean };
  hunger?: { value?: number; rate?: number; lastFed?: number };
  behavior?: { schoolingPreference?: number; personalSpace?: number; isHungry?: boolean; isFleeing?: boolean; isSchooling?: boolean; isResting?: boolean; isMating?: boolean; lastBreedTime?: number; breedCooldown?: number };
  renderable?: { model?: any; scale?: number; visible?: boolean };
  genetics?: { size?: number; speed?: number; metabolism?: number; color?: number[] };
}

export class FishFactory {
  static create(world: any, options: FishOptions = {}) {
    const genetics = {
      size: 0.8 + Math.random() * 0.8,
      speed: 4 + Math.random() * 4,
      metabolism: 0.8 + Math.random() * 0.4,
      color: [
        Math.floor(80 + Math.random() * 120),
        Math.floor(120 + Math.random() * 120),
        Math.floor(150 + Math.random() * 105)
      ],
      ...options.genetics
    };
    
    const angle = Math.random() * Math.PI * 2;
    const verticalAngle = (Math.random() - 0.5) * 0.3;
    const initialSpeed = 0.4 + Math.random() * 0.4;
    
    const initialVelocity = {
      x: Math.cos(angle) * Math.cos(verticalAngle) * genetics.speed * initialSpeed,
      y: Math.sin(verticalAngle) * genetics.speed * initialSpeed * 0.5,
      z: Math.sin(angle) * Math.cos(verticalAngle) * genetics.speed * initialSpeed,
      maxSpeed: genetics.speed,
      ...options.velocity
    };
    
    const config = {
      position: { x: 0, y: 10, z: 0, ...options.position },
      velocity: initialVelocity,
      health: { current: 100, max: 100, regenRate: 0.1, isDead: false, ...options.health },
      age: { value: 0, maturityAge: 60, maxAge: 300, ...options.age },
      hunger: { 
        value: 0.4 + Math.random() * 0.3,
        rate: 0.012 + Math.random() * 0.008,
        ...options.hunger 
      },
      behavior: { 
        schoolingPreference: 0.6 + Math.random() * 0.4,
        personalSpace: 1 + Math.random() * 0.8,
        isHungry: false,
        isFleeing: false,
        isSchooling: true,
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
