import { InstancedMesh, Mesh, Scene, Vector4 } from '@babylonjs/core';
import { createCrabMesh } from '../models/crab_model';
import { createFishMesh } from '../models/fish_model';
import { createFoodMesh } from '../models/food_model';
import { createSharkMesh } from '../models/shark';
import type { AmbienceBinder } from './ambient';
import { createCreatureMaterial } from './creature_material';

export type RGB255 = number[];

/** Creates instances of each creature template, wired to the shared shaders. */
export class ModelLibrary {
  private fish: Mesh;
  private shark: Mesh;
  private crab: Mesh;
  private food: Mesh;

  constructor(scene: Scene, binder: AmbienceBinder, simClock: () => number) {
    this.fish = createFishMesh(scene);
    this.fish.material = binder.add(createCreatureMaterial('fishMat', scene, {
      swimAmp: 0.2, swimFreq: 8.5, waveLength: 3.2, bellyColor: [0.93, 0.96, 0.92], countershade: 0.38, sheen: 0.4
    }), simClock);

    this.shark = createSharkMesh(scene);
    this.shark.material = binder.add(createCreatureMaterial('sharkMat', scene, {
      swimAmp: 0.22, swimFreq: 3.4, waveLength: 1.6, bellyColor: [0.94, 0.96, 0.98], countershade: 0.55, sheen: 0.25
    }), simClock);

    for (const m of [this.fish, this.shark]) {
      m.isVisible = false;
      m.registerInstancedBuffer('instColor', 4);
      m.registerInstancedBuffer('instParams', 4);
    }

    this.crab = createCrabMesh(scene);
    this.food = createFoodMesh(scene);
  }

  createFish(id: number, color: RGB255, scale: number, speed: number): InstancedMesh {
    const inst = this.fish.createInstance(`fish_${id}`);
    this.initCreature(inst, color, scale, 7 + speed * 0.1);
    return inst;
  }

  createShark(id: number, color: RGB255, scale: number): InstancedMesh {
    const inst = this.shark.createInstance(`shark_${id}`);
    // Sharks keep a classic slate-grey top regardless of their genes' blue tint.
    const slate: RGB255 = [color[0] * 0.5 + 58, color[1] * 0.5 + 66, color[2] * 0.5 + 84];
    this.initCreature(inst, slate, scale, 1);
    return inst;
  }

  createCrab(id: number, scale: number): InstancedMesh {
    const inst = this.crab.createInstance(`crab_${id}`);
    inst.scaling.setAll(scale);
    return inst;
  }

  createFood(id: number, scale: number): InstancedMesh {
    const inst = this.food.createInstance(`food_${id}`);
    inst.scaling.setAll(scale);
    return inst;
  }

  private initCreature(inst: InstancedMesh, color: RGB255, scale: number, rate: number) {
    inst.scaling.setAll(scale);
    inst.rotation.y = Math.random() * Math.PI * 2;
    inst.instancedBuffers.instColor = new Vector4(color[0] / 255, color[1] / 255, color[2] / 255, 1);
    inst.instancedBuffers.instParams = new Vector4(Math.random() * Math.PI * 2, rate / 8, 0, 0);
  }
}

/** Visual state a creature's shader reads each frame. No-ops for non-shader meshes. */
export function setCreatureState(
  model: any,
  state: { hunger?: number; flash?: number; vitality?: number }
) {
  const b = model?.instancedBuffers;
  if (!b) return;
  if (state.vitality !== undefined && b.instColor) b.instColor.w = state.vitality;
  if (b.instParams) {
    if (state.hunger !== undefined) b.instParams.z = state.hunger;
    if (state.flash !== undefined) b.instParams.w = state.flash;
  }
}
