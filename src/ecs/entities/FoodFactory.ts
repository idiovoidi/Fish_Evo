import { Position } from '../components/Position';
import { Velocity } from '../components/Velocity';
import { Renderable } from '../components/Renderable';
import { FoodTag } from '../components/Tags';

interface FoodOptions {
  position?: { x?: number; y?: number; z?: number };
  velocity?: { x?: number; y?: number; z?: number; maxSpeed?: number };
  renderable?: { model?: any; scale?: number; visible?: boolean };
}

export class FoodFactory {
  static create(world: any, options: FoodOptions = {}) {
    const config = {
      position: { 
        x: (Math.random() - 0.5) * 80,
        y: 30,
        z: (Math.random() - 0.5) * 80,
        ...options.position 
      },
      velocity: { 
        x: 0, 
        y: -1 - Math.random() * 2,
        z: 0, 
        maxSpeed: 3,
        ...options.velocity 
      },
      renderable: { 
        model: null, 
        scale: 0.5 + Math.random() * 0.3,
        ...options.renderable 
      }
    };
    
    const food = world
      .createEntity()
      .addComponent(Position, config.position)
      .addComponent(Velocity, config.velocity)
      .addComponent(Renderable, config.renderable)
      .addComponent(FoodTag);
    
    return food;
  }
}
