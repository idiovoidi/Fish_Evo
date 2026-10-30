import { Position } from '../components/Position';
import { Velocity } from '../components/Velocity';
import { Renderable } from '../components/Renderable';
import { Lifespan } from '../components/Lifespan';
import { FoodTag } from '../components/Tags';
import { SimulationConfig } from '../../config/simulation_config';

interface FoodOptions {
  position?: { x?: number; y?: number; z?: number };
  velocity?: { x?: number; y?: number; z?: number; maxSpeed?: number };
  renderable?: { model?: any; scale?: number; visible?: boolean };
}

export class FoodFactory {
  static create(world: any, options: FoodOptions = {}) {
    const bounds = SimulationConfig.world.bounds;
    const span = (min: number, max: number) => min + 6 + Math.random() * (max - min - 12);

    return world
      .createEntity()
      .addComponent(Position, {
        x: span(bounds.minX, bounds.maxX),
        y: bounds.maxY - 1,
        z: span(bounds.minZ, bounds.maxZ),
        ...options.position
      })
      .addComponent(Velocity, {
        x: 0,
        y: -(0.9 + Math.random() * 1.1),
        z: 0,
        maxSpeed: 3,
        ...options.velocity
      })
      .addComponent(Renderable, {
        model: null,
        scale: 0.8 + Math.random() * 0.5,
        ...options.renderable
      })
      .addComponent(Lifespan, { age: 0, max: SimulationConfig.food.lifetime + 25 })
      .addComponent(FoodTag);
  }
}
