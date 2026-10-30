import { Position } from '../components/Position';
import { Velocity } from '../components/Velocity';
import { Renderable } from '../components/Renderable';
import { Health } from '../components/Health';
import { Age } from '../components/Age';
import { Behavior } from '../components/Behavior';
import { CrabTag } from '../components/Tags';
import { SimulationConfig } from '../../config/simulation_config';
import { terrainHeight } from '../../environment/terrain_height';

interface CrabOptions {
  position?: { x?: number; y?: number; z?: number };
  velocity?: { x?: number; y?: number; z?: number; maxSpeed?: number };
  health?: { current?: number; max?: number; regenRate?: number; isDead?: boolean };
  age?: { value?: number; maturityAge?: number; maxAge?: number; isAdult?: boolean };
  behavior?: { schoolingPreference?: number; personalSpace?: number; isHungry?: boolean; isFleeing?: boolean; isSchooling?: boolean; isResting?: boolean; isMating?: boolean; waitTime?: number; waitDuration?: number; lastStateChange?: number };
  renderable?: { model?: any; scale?: number; visible?: boolean };
}

export class CrabFactory {
  static create(world: any, options: CrabOptions = {}) {
    const config = {
      position: { 
        x: (Math.random() - 0.5) * 80,
        y: 0,
        z: (Math.random() - 0.5) * 80,
        ...options.position 
      },
      velocity: { 
        x: 0, 
        y: 0, 
        z: 0, 
        maxSpeed: SimulationConfig.entities.crabs.maxSpeed,
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
        maturityAge: 120,
        maxAge: 1e7, // crabs don't breed, so they don't die of old age either
        isAdult: false,
        ...options.age
      },
      behavior: { 
        schoolingPreference: 0.0,
        personalSpace: 2.0,
        isHungry: false,
        isFleeing: false,
        isSchooling: false,
        isResting: Math.random() > 0.7,
        isMating: false,
        waitTime: 0,
        waitDuration: 3 + Math.random() * 2,
        lastStateChange: 0,
        ...options.behavior 
      },
      renderable: { 
        model: null, 
        scale: 0.8 + Math.random() * 0.4,
        visible: true,
        ...options.renderable 
      }
    };
    
    const p = config.position;
    p.y = terrainHeight(p.x, p.z) + SimulationConfig.entities.crabs.spawnHeight;

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
