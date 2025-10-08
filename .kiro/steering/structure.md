# Project Structure

## Directory Organization

```
/
├── config/              # Simulation configuration
│   └── simulation_config.js  # Global settings (SimulationConfig)
├── core/                # Core simulation logic
│   ├── Camera.js        # Camera setup and controls
│   ├── Scene.js         # Babylon.js scene initialization
│   ├── Simulation.js    # ECS world manager and game loop
│   ├── start-ecs.js     # ECS bootstrap (ES module)
│   └── UIManager.js     # HUD and entity inspector
├── ecs/                 # Entity-Component-System architecture
│   ├── components/      # Data-only component definitions
│   ├── entities/        # Entity factory functions (FishFactory, etc.)
│   └── systems/         # Game logic systems
├── utils/               # Utility modules
│   ├── errorHandling.js # Higher-order functions for error handling
│   └── exceptions.js    # Custom exception classes
├── models/              # 3D model assets (GLTF)
├── memory-bank/         # Design documentation
└── index.html           # Entry point
```

## ECS Architecture

### Components (`ecs/components/`)
Plain data objects with no logic:
- `Position`, `Velocity`, `Renderable`, `Health`, `Age`, `Hunger`, `Behavior`, `Genetics`, `PredatorState`
- Tag components: `FishTag`, `SharkTag`, `CrabTag`, `FoodTag`, etc.

### Systems (`ecs/systems/`)
Execute in order each frame:
1. `SpatialHashSystem` - Build spatial grid for proximity queries
2. `BabylonMeshSystem` - Create/manage 3D meshes
3. `FoodSpawnerSystem` - Spawn food particles
4. `AgingSystem`, `HungerSystem` - Update entity states
5. `FoodConsumptionSystem`, `BreedingSystem`, `SharkSystem` - Behaviors
6. `WanderSystem`, `SchoolingSystem`, `MovementSystem` - Movement
7. `RenderSystem` - Sync positions to meshes

### Entity Factories (`ecs/entities/`)
Create entities with component bundles:
- `FishFactory`, `FoodFactory`, `SharkFactory`, `CrabFactory`

## Bootstrap Flow

1. `index.html` loads Babylon.js, ECSY, and scripts
2. `core/Scene.js` initializes Babylon scene, camera, terrain, lighting, day/night cycle
3. `core/start-ecs.js` creates `Simulation` instance and calls `initialize(scene)`
4. `Simulation.js` registers components/systems, creates initial entities, starts game loop

## Code Conventions

- **ES Modules**: Use `import`/`export` syntax
- **Error Handling**: Wrap critical methods with `withErrorHandler()` HOF from `utils/errorHandling.js`
- **Global Access**: `window.ECSY`, `window.SimulationConfig`, `window.sceneManager`, `window.uiManager`
- **Mesh-Entity Mapping**: Set `mesh.entity = entity` for UI picking/inspection
- **System Queries**: Define `SystemName.queries` static property for entity filtering
