import { ECSY } from '../ecsy';
import type { ModelLibrary } from '../../render/model_library';
import { Renderable } from '../components/Renderable';
import { Position } from '../components/Position';
import { Genetics } from '../components/Genetics';
import { Velocity } from '../components/Velocity';
import { FishTag, FoodTag, SharkTag, CrabTag } from '../components/Tags';

/** Creates a render instance for each new entity and disposes it when the entity goes. */
export class BabylonMeshSystem extends ECSY.System {
  models: ModelLibrary | null = null;

  setModels(models: ModelLibrary) {
    this.models = models;
  }

  execute() {
    const models = this.models;
    if (!models) return;

    this.queries.newFish.added.forEach((entity: any) => {
      const g = entity.getComponent(Genetics);
      const r = entity.getMutableComponent(Renderable);
      this.attach(entity, r, models.createFish(entity.id, g.color, r.scale, entity.getComponent(Velocity).maxSpeed));
    });
    this.queries.newShark.added.forEach((entity: any) => {
      const g = entity.getComponent(Genetics);
      const r = entity.getMutableComponent(Renderable);
      this.attach(entity, r, models.createShark(entity.id, g.color, r.scale));
    });
    this.queries.newCrab.added.forEach((entity: any) => {
      const r = entity.getMutableComponent(Renderable);
      this.attach(entity, r, models.createCrab(entity.id, r.scale));
    });
    this.queries.newFood.added.forEach((entity: any) => {
      const r = entity.getMutableComponent(Renderable);
      this.attach(entity, r, models.createFood(entity.id, r.scale));
    });

    this.queries.removed.removed.forEach((entity: any) => {
      // Components of a removed entity are only reachable with includeRemoved.
      const renderable = entity.getComponent(Renderable, true);
      renderable?.model?.dispose();
      if (renderable) renderable.model = null;
    });
  }

  private attach(entity: any, renderable: any, model: any) {
    const p = entity.getComponent(Position);
    model.position.set(p.x, p.y, p.z);
    model.entity = entity;
    renderable.model = model;
  }
}

(BabylonMeshSystem as any).queries = {
  newFish: { components: [Renderable, FishTag], listen: { added: true } },
  newFood: { components: [Renderable, FoodTag], listen: { added: true } },
  newShark: { components: [Renderable, SharkTag], listen: { added: true } },
  newCrab: { components: [Renderable, CrabTag], listen: { added: true } },
  removed: { components: [Renderable], listen: { removed: true } }
};
