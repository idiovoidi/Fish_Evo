import { Position } from '../ecs/components/Position.js';
import { Velocity } from '../ecs/components/Velocity.js';
import { Renderable } from '../ecs/components/Renderable.js';
import { Health } from '../ecs/components/Health.js';
import { Age } from '../ecs/components/Age.js';
import { Hunger } from '../ecs/components/Hunger.js';
import { Behavior } from '../ecs/components/Behavior.js';
import { Genetics } from '../ecs/components/Genetics.js';
import { PredatorState } from '../ecs/components/PredatorState.js';
import { 
  TagComponent, FishTag, SharkTag, CrabTag, 
  FoodTag, SeaweedTag, CoralTag, DebrisTag 
} from '../ecs/components/Tags.js';

import { MovementSystem } from '../ecs/systems/MovementSystem.js';
import { HungerSystem } from '../ecs/systems/HungerSystem.js';
import { RenderSystem } from '../ecs/systems/RenderSystem.js';
import { BabylonMeshSystem } from '../ecs/systems/BabylonMeshSystem.js';
import { FoodSpawnerSystem } from '../ecs/systems/FoodSpawnerSystem.js';
import { FoodConsumptionSystem } from '../ecs/systems/FoodConsumptionSystem.js';
import { BreedingSystem } from '../ecs/systems/BreedingSystem.js';
import { AgingSystem } from '../ecs/systems/AgingSystem.js';
import { SharkSystem } from '../ecs/systems/SharkSystem.js';
import { SpatialHashSystem } from '../ecs/systems/SpatialHashSystem.js';
import { WanderSystem } from '../ecs/systems/WanderSystem.js';
import { SchoolingSystem } from '../ecs/systems/SchoolingSystem.js';
import { CrabSystem } from '../ecs/systems/CrabSystem.js';
import { DeathSystem } from '../ecs/systems/DeathSystem.js';
import { PopulationStatsSystem } from '../ecs/systems/PopulationStatsSystem.js';

import { FishFactory } from '../ecs/entities/FishFactory.js';
import { FoodFactory } from '../ecs/entities/FoodFactory.js';
import { SharkFactory } from '../ecs/entities/SharkFactory.js';
import { CrabFactory } from '../ecs/entities/CrabFactory.js';

import { UIManager } from './UIManager.js';
import { setDebugLogging } from '../utils/logger.js';
import { withErrorHandler } from '../utils/errorHandling.js';

export class Simulation {
  world: any;
  running: boolean = false;
  lastTime: number = 0;
  scene: any = null;
  babylonMeshSystem: any;
  foodSpawnerSystem: any;
  foodConsumptionSystem: any;
  uiManager: UIManager | null = null;

  constructor() {
    this.world = new (window as any).ECSY.World();
    
    this.registerComponents();
    this.registerSystems();
    
    this.running = false;
    this.lastTime = 0;
    this.scene = null;
    
    this.babylonMeshSystem = this.world.getSystem(BabylonMeshSystem);
    this.foodSpawnerSystem = this.world.getSystem(FoodSpawnerSystem);
    this.foodConsumptionSystem = this.world.getSystem(FoodConsumptionSystem);
    
    const wrappedUpdate = withErrorHandler(this._update.bind(this), 'Simulation.update');
    const wrappedInit = withErrorHandler(this._initialize.bind(this), 'Simulation.initialize');
    this.update = wrappedUpdate as (delta: number, time: number) => void;
    this.initialize = wrappedInit as (scene: any) => void;

    this.uiManager = null;
  }
  
  private _update(delta: number, time: number) {
    this.world.execute(delta, time);
  }
  
  private _initialize(scene: any) {
    this.scene = scene;
    
    this.babylonMeshSystem.setScene(scene);
    
    const cfg = (typeof window !== 'undefined' && (window as any).SimulationConfig) ? (window as any).SimulationConfig : null;
    setDebugLogging(!!cfg?.debug);
    const foodCfg = cfg?.food || {};
    this.foodSpawnerSystem.updateConfig({
      spawnInterval: foodCfg.spawnInterval || 2000,
      spawnMinCount: 1,
      spawnMaxCount: 2,
      maxFoodCount: foodCfg.maxParticles || 30
    });
    
    this.createInitialEntities();
    
    this.start();

    this.uiManager = new UIManager(scene, this, { Position, Renderable });
  }
  
  update(delta: number, time: number): void {
    this._update(delta, time);
  }
  
  initialize(scene: any): void {
    this._initialize(scene);
  }
  
  registerComponents() {
    this.world
      .registerComponent(Position)
      .registerComponent(Velocity)
      .registerComponent(Renderable)
      .registerComponent(Health)
      .registerComponent(Age)
      .registerComponent(Hunger)
      .registerComponent(Behavior)
      .registerComponent(Genetics)
      .registerComponent(PredatorState)
      .registerComponent(TagComponent)
      .registerComponent(FishTag)
      .registerComponent(SharkTag)
      .registerComponent(CrabTag)
      .registerComponent(FoodTag)
      .registerComponent(SeaweedTag)
      .registerComponent(CoralTag)
      .registerComponent(DebrisTag);
  }
  
  registerSystems() {
    this.world
      .registerSystem(SpatialHashSystem)
      .registerSystem(BabylonMeshSystem)
      .registerSystem(FoodSpawnerSystem)
      .registerSystem(AgingSystem)
      .registerSystem(HungerSystem)
      .registerSystem(DeathSystem)
      .registerSystem(FoodConsumptionSystem)
      .registerSystem(BreedingSystem)
      .registerSystem(SharkSystem)
      .registerSystem(CrabSystem)
      .registerSystem(WanderSystem)
      .registerSystem(SchoolingSystem)
      .registerSystem(MovementSystem)
      .registerSystem(RenderSystem)
      .registerSystem(PopulationStatsSystem);
  }
  
  createInitialEntities() {
    const schoolCount = 3;
    const fishPerSchool = 4;
    
    for (let school = 0; school < schoolCount; school++) {
      const schoolCenter = {
        x: (Math.random() - 0.5) * 80,
        y: 8 + Math.random() * 15,
        z: (Math.random() - 0.5) * 80
      };
      
      for (let i = 0; i < fishPerSchool; i++) {
        FishFactory.create(this.world, {
          position: {
            x: schoolCenter.x + (Math.random() - 0.5) * 10,
            y: schoolCenter.y + (Math.random() - 0.5) * 4,
            z: schoolCenter.z + (Math.random() - 0.5) * 10
          }
        });
      }
    }
    
    for (let i = 0; i < 8; i++) {
      FoodFactory.create(this.world, {
        position: {
          x: (Math.random() - 0.5) * 80,
          y: 5 + Math.random() * 20,
          z: (Math.random() - 0.5) * 80
        }
      });
    }
    
    for (let i = 0; i < 2; i++) {
      SharkFactory.create(this.world, {
        position: {
          x: (Math.random() - 0.5) * 60,
          y: 10 + Math.random() * 15,
          z: (Math.random() - 0.5) * 60
        }
      });
    }
    
    const cfg = (typeof window !== 'undefined' && (window as any).SimulationConfig) ? (window as any).SimulationConfig : null;
    const crabCount = cfg?.entities?.crabs?.count || 8;
    
    for (let i = 0; i < crabCount; i++) {
      CrabFactory.create(this.world, {
        position: {
          x: (Math.random() - 0.5) * 80,
          y: 0,
          z: (Math.random() - 0.5) * 80
        }
      });
    }
  }
  
  start() {
    this.running = true;
    this.lastTime = performance.now();
    this.loop();
  }
  
  stop() {
    this.running = false;
  }
  
  loop() {
    if (!this.running) return;
    
    const time = performance.now();
    const delta = time - this.lastTime;
    
    this.update(delta, time);
    
    this.lastTime = time;
    requestAnimationFrame(this.loop.bind(this));
  }

  cleanup() {
    this.stop();
    this.world.clear();
  }
}
