import { withErrorHandler } from '../utils/errorHandling.js';

// Import components
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

// Import systems
import { MovementSystem } from '../ecs/systems/MovementSystem.js';
import { HungerSystem } from '../ecs/systems/HungerSystem.js';
import { RenderSystem } from '../ecs/systems/RenderSystem.js';
import { BabylonMeshSystem } from '../ecs/systems/BabylonMeshSystem.js';
import { FoodSpawnerSystem } from '../ecs/systems/FoodSpawnerSystem.js';
import { BreedingSystem } from '../ecs/systems/BreedingSystem.js';
import { SharkSystem } from '../ecs/systems/SharkSystem.js';
import { SpatialHashSystem } from '../ecs/systems/SpatialHashSystem.js';
import { WanderSystem } from '../ecs/systems/WanderSystem.js';
import { SchoolingSystem } from '../ecs/systems/SchoolingSystem.js';

// Import entity factories
import { FishFactory } from '../ecs/entities/FishFactory.js';
import { FoodFactory } from '../ecs/entities/FoodFactory.js';
import { SharkFactory } from '../ecs/entities/SharkFactory.js';

import { UIManager } from './UIManager.js';

/**
 * Core simulation class that manages the ECS world and game loop
 */
export class Simulation {
  constructor() {
    // Create the ECSY world
    this.world = new window.ECSY.World();
    
    // Register all components
    this.registerComponents();
    
    // Register all systems
    this.registerSystems();
    
    // Setup variables for game loop
    this.running = false;
    this.lastTime = 0;
    this.scene = null; // Will be set by initialize method
    
    // Store systems that need a scene reference
    this.babylonMeshSystem = this.world.getSystem(BabylonMeshSystem);
    this.foodSpawnerSystem = this.world.getSystem(FoodSpawnerSystem);
    
    // Wrap methods with error handling
    this.update = withErrorHandler(this.update.bind(this), 'Simulation.update');
    this.initialize = withErrorHandler(this.initialize.bind(this), 'Simulation.initialize');

    this.uiManager = null;
  }
  
  /**
   * Register all components with the ECS world
   */
  registerComponents() {
    // Register all components
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
  
  /**
   * Register all systems with the ECS world
   */
  registerSystems() {
    // Register all systems in the order they should execute
    this.world
      .registerSystem(SpatialHashSystem)  // Build spatial grid
      .registerSystem(BabylonMeshSystem)
      .registerSystem(FoodSpawnerSystem) // Then spawn food
      .registerSystem(HungerSystem)      // Update hunger states
      .registerSystem(BreedingSystem)     // Handle breeding & offspring
      .registerSystem(SharkSystem)         // Predator logic
      .registerSystem(WanderSystem)        // Simple wander to keep fish moving
      .registerSystem(SchoolingSystem)     // Cohesion/Separation
      .registerSystem(MovementSystem)      // Move entities
      .registerSystem(RenderSystem);        // Update visual positions
  }
  
  /**
   * Initialize the simulation with the BabylonJS scene
   * @param {Scene} scene - The Babylon.js scene
   */
  initialize(scene) {
    this.scene = scene;
    
    // Pass the scene to systems that need it
    this.babylonMeshSystem.setScene(scene);
    
    // Configure food spawner from SimulationConfig when available
    const cfg = (typeof window !== 'undefined' && window.SimulationConfig) ? window.SimulationConfig : null;
    const foodCfg = cfg?.food || {};
    this.foodSpawnerSystem.updateConfig({
      spawnInterval: foodCfg.spawnInterval || 2000,
      spawnMinCount: 1,
      spawnMaxCount: 2,
      maxFoodCount: foodCfg.maxParticles || 30
    });
    
    // Create initial entities
    this.createInitialEntities();
    
    // Start the game loop
    this.start();

    this.uiManager = new UIManager(scene, this);
  }
  
  /**
   * Create initial entities for the simulation
   */
  createInitialEntities() {
    // Create some fish
    for (let i = 0; i < 20; i++) {
      const fish = FishFactory.create(this.world, {
        position: {
          x: (Math.random() - 0.5) * 60,
          y: 5 + Math.random() * 20,
          z: (Math.random() - 0.5) * 60
        },
        velocity: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
          z: (Math.random() - 0.5) * 2
        }
      });
    }
    
    // Create some initial food
    for (let i = 0; i < 10; i++) {
      const food = FoodFactory.create(this.world);
    }
    
    // Create some sharks
    for (let i = 0; i < 3; i++) {
      const shark = SharkFactory.create(this.world, {
        position: {
          x: (Math.random() - 0.5) * 60,
          y: 5 + Math.random() * 20,
          z: (Math.random() - 0.5) * 60
        },
        velocity: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
          z: (Math.random() - 0.5) * 2
        }
      });
    }
  }
  
  /**
   * Start the simulation loop
   */
  start() {
    this.running = true;
    this.lastTime = performance.now();
    this.loop();
  }
  
  /**
   * Stop the simulation loop
   */
  stop() {
    this.running = false;
  }
  
  /**
   * Main game loop
   */
  loop() {
    if (!this.running) return;
    
    const time = performance.now();
    const delta = time - this.lastTime;
    
    this.update(delta, time);
    
    this.lastTime = time;
    requestAnimationFrame(this.loop.bind(this));
  }
  
  /**
   * Update the simulation for a single frame
   * @param {number} delta - Time elapsed since last update in milliseconds
   * @param {number} time - Current timestamp
   */
  update(delta, time) {
    // Execute all systems
    this.world.execute(delta, time);
  }
  
  /**
   * Clean up the simulation
   */
  cleanup() {
    this.stop();
    this.world.clear();
  }
} 