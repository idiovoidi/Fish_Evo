import { ECSY } from '../ecs/ecsy';

import { Position } from '../ecs/components/Position';
import { Velocity } from '../ecs/components/Velocity';
import { Renderable } from '../ecs/components/Renderable';
import { Health } from '../ecs/components/Health';
import { Age } from '../ecs/components/Age';
import { Hunger } from '../ecs/components/Hunger';
import { Behavior } from '../ecs/components/Behavior';
import { Genetics } from '../ecs/components/Genetics';
import { PredatorState } from '../ecs/components/PredatorState';
import { Effects } from '../ecs/components/Effects';
import { Lifespan } from '../ecs/components/Lifespan';
import {
  TagComponent, FishTag, SharkTag, CrabTag, FoodTag, SeaweedTag, CoralTag, DebrisTag
} from '../ecs/components/Tags';

import { SpatialHashSystem } from '../ecs/systems/SpatialHashSystem';
import { BabylonMeshSystem } from '../ecs/systems/BabylonMeshSystem';
import { FoodSpawnerSystem } from '../ecs/systems/FoodSpawnerSystem';
import { AgingSystem } from '../ecs/systems/AgingSystem';
import { HungerSystem } from '../ecs/systems/HungerSystem';
import { DeathSystem } from '../ecs/systems/DeathSystem';
import { FoodConsumptionSystem } from '../ecs/systems/FoodConsumptionSystem';
import { BreedingSystem } from '../ecs/systems/BreedingSystem';
import { SharkSystem } from '../ecs/systems/SharkSystem';
import { CrabSystem } from '../ecs/systems/CrabSystem';
import { WanderSystem } from '../ecs/systems/WanderSystem';
import { SchoolingSystem } from '../ecs/systems/SchoolingSystem';
import { FleeSystem } from '../ecs/systems/FleeSystem';
import { MovementSystem } from '../ecs/systems/MovementSystem';
import { RenderSystem } from '../ecs/systems/RenderSystem';
import { PopulationStatsSystem } from '../ecs/systems/PopulationStatsSystem';

import { FishFactory } from '../ecs/entities/FishFactory';
import { FoodFactory } from '../ecs/entities/FoodFactory';
import { SharkFactory } from '../ecs/entities/SharkFactory';
import { CrabFactory } from '../ecs/entities/CrabFactory';

import { SimulationConfig } from '../config/simulation_config';
import { terrainHeight } from '../environment/terrain_height';
import { setDebugLogging } from '../utils/logger';
import { resetStats } from './stats';
import type { Scene } from './Scene';

/** Longest real frame (ms) we'll simulate, so a backgrounded tab doesn't explode on return. */
const MAX_FRAME_MS = 250;

const rand = (min: number, max: number) => min + Math.random() * (max - min);

export class Simulation {
  readonly world: any;
  scene!: Scene;
  paused = false;
  /** Multiplier on simulated time (1 = real time). */
  timeScale = 1;
  /** Simulation clock in milliseconds; frozen while paused. */
  time = 0;

  private meshSystem: any;
  private foodSpawner: any;

  constructor() {
    this.world = new ECSY.World();
    this.registerComponents();
    this.registerSystems();
    this.meshSystem = this.world.getSystem(BabylonMeshSystem);
    this.foodSpawner = this.world.getSystem(FoodSpawnerSystem);
    setDebugLogging(SimulationConfig.debug.logging);
  }

  initialize(scene: Scene) {
    this.scene = scene;
    this.meshSystem.setModels(scene.models);
    this.createInitialEntities();
    scene.scene.onBeforeRenderObservable.add(() => this.frame());
  }

  /** Advances the ECS by one rendered frame, sub-stepping when fast-forwarding. */
  private frame() {
    this.foodSpawner.daylight = this.scene.dayNight.daylight;
    if (this.paused) return;

    const real = Math.min(this.scene.engine.getDeltaTime(), MAX_FRAME_MS);
    const total = real * this.timeScale;
    const steps = Math.max(1, Math.ceil(total / SimulationConfig.maxStepMs));
    const step = total / steps;
    for (let i = 0; i < steps; i++) {
      this.time += step;
      try {
        this.world.execute(step, this.time);
      } catch (err) {
        console.error('Simulation step failed:', err);
        break;
      }
    }
    this.scene.simTime = this.time / 1000;
  }

  private registerComponents() {
    [
      Position, Velocity, Renderable, Health, Age, Hunger, Behavior, Genetics, PredatorState,
      Effects, Lifespan,
      TagComponent, FishTag, SharkTag, CrabTag, FoodTag, SeaweedTag, CoralTag, DebrisTag
    ].forEach((c) => this.world.registerComponent(c));
  }

  /** Registration order is execution order. */
  private registerSystems() {
    [
      SpatialHashSystem, BabylonMeshSystem, FoodSpawnerSystem, AgingSystem, HungerSystem,
      DeathSystem, FoodConsumptionSystem, BreedingSystem, SharkSystem, CrabSystem,
      WanderSystem, SchoolingSystem, FleeSystem, MovementSystem, RenderSystem,
      PopulationStatsSystem
    ].forEach((s) => this.world.registerSystem(s));
  }

  private createInitialEntities() {
    const { fish, sharks, crabs } = SimulationConfig.entities;
    for (let i = 0; i < fish.schools; i++) this.spawnSchool(fish.perSchool);
    for (let i = 0; i < 10; i++) FoodFactory.create(this.world, { position: { y: rand(8, 24) } });
    for (let i = 0; i < sharks.count; i++) this.spawnShark();
    for (let i = 0; i < crabs.count; i++) {
      CrabFactory.create(this.world, { position: { x: rand(-42, 42), z: rand(-42, 42) } });
    }
  }

  // ---- Actions available to the UI --------------------------------------------------

  spawnSchool(count = 6, center?: { x: number; y: number; z: number }) {
    const c = center ?? { x: rand(-35, 35), y: rand(10, 22), z: rand(-35, 35) };
    for (let i = 0; i < count; i++) {
      FishFactory.create(this.world, {
        position: { x: c.x + rand(-5, 5), y: c.y + rand(-2, 2), z: c.z + rand(-5, 5) }
      });
    }
  }

  spawnShark() {
    const x = rand(-35, 35);
    const z = rand(-35, 35);
    return SharkFactory.create(this.world, { position: { x, y: terrainHeight(x, z) + rand(8, 14), z } });
  }

  dropFood(count = 8, center?: { x: number; z: number }) {
    for (let i = 0; i < count; i++) {
      const base = center ?? { x: rand(-30, 30), z: rand(-30, 30) };
      FoodFactory.create(this.world, {
        position: { x: base.x + rand(-4, 4), y: SimulationConfig.world.bounds.maxY - 1 - Math.random(), z: base.z + rand(-4, 4) }
      });
    }
  }

  /** Wipes the ecosystem and starts over with the founding population. */
  reset() {
    this.world.entityManager.removeAllEntities();
    resetStats();
    this.time = 0;
    this.createInitialEntities();
  }

  setFoodEnabled(enabled: boolean) {
    this.foodSpawner.enabled = enabled;
  }

  get foodEnabled(): boolean {
    return this.foodSpawner.enabled;
  }
}
