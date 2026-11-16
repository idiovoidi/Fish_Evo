# Fish_Evo - Aquatic Life Simulation Specification

## Project Overview

**Fish_Evo** is a 3D aquatic ecosystem simulation that models realistic underwater life behaviors including fish schooling, predator-prey interactions, hunger systems, genetics, breeding, and environmental dynamics. Built with Babylon.js for 3D rendering and ECSY for Entity-Component-System architecture, it provides an extensible framework for simulating complex ecological relationships in an immersive underwater environment.

### Core Features
- Real-time 3D underwater environment with day-night cycles
- Fish schooling behavior with cohesion, separation, and alignment (boids algorithm)
- Predator-prey interactions between sharks and fish
- Dynamic food spawning and consumption systems
- Genetic system for evolutionary traits (size, speed, metabolism, color)
- Breeding and lifecycle management with age-based maturity
- Spatial optimization for performance using hash-based grids
- Comprehensive environmental elements (coral, seaweed, debris, landscape)

### Value Proposition
- **Educational**: Demonstrates ecological principles and evolution in action
- **Research**: Provides a platform for studying artificial life and emergent behaviors
- **Entertainment**: Offers an engaging simulation experience with visual appeal
- **Extensible**: Modular architecture allows for easy addition of new features

## Technology Stack & Dependencies

### Core Technologies
- **Babylon.js** - 3D rendering engine and WebGL graphics
- **ECSY v0.4.3** - Entity-Component-System framework for game logic
- **Yuka** - AI navigation library (referenced in package.json as yuka-babylon-navigation)
- **ES6+ Modules** - Modern JavaScript with import/export syntax

### Development & Deployment
- **Node.js** - Runtime for development tools
- **http-server v14.1.1** - Local development server
- **npm** - Package management

### Browser Requirements
- **WebGL 2.0** support required
- **ES6 modules** support required
- **Modern browsers**: Chrome 60+, Firefox 55+, Edge 79+, Safari 12+

### External Dependencies (CDN)
```html
<!-- Core Libraries -->
<script src="https://cdn.babylonjs.com/babylon.js"></script>
<script src="https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js"></script>
<script src="https://cdn.babylonjs.com/gui/babylon.gui.min.js"></script>
<script src="https://cdn.babylonjs.com/recast.js"></script>
<script src="https://unpkg.com/yuka"></script>
<script src="https://unpkg.com/ecsy/build/ecsy.js"></script>
<script src="https://cdn.babylonjs.com/serializers/babylonjs.serializers.min.js"></script>
```

## Architecture & Design Patterns

### Entity-Component-System (ECS) Architecture

The simulation follows a strict ECS pattern using the ECSY library:

**Components** (Data containers):
- Store only data, no logic
- Defined using ECSY.Component with schema definitions
- Located in `ecs/components/`

**Systems** (Logic processors):
- Contain all game logic
- Query entities by component combinations
- Execute in defined order each frame
- Located in `ecs/systems/`

**Entities** (Identifiers):
- Created by factory classes
- Composed of multiple components
- Managed by ECSY World instance

### Core Design Patterns

1. **Factory Pattern**: Entity creation through specialized factory classes
   - `FishFactory.create()` for fish entities
   - `FoodFactory.create()` for food particles
   - `SharkFactory.create()` for predators

2. **Observer Pattern**: Event handling through Babylon.js observables
   - Scene update loops
   - User interaction handling

3. **Spatial Partitioning**: Hash-based grid for efficient collision detection
   - O(1) neighbor queries instead of O(n²)
   - Configurable grid cell sizes

4. **Object Pooling**: Mesh reuse to prevent garbage collection
   - Cached materials for genetic color variations
   - Template-based mesh cloning

## Component System Specification

### Core Components

#### Position Component
```javascript
Position.schema = {
  x: { type: ECSY.Types.Number, default: 0 },
  y: { type: ECSY.Types.Number, default: 0 },
  z: { type: ECSY.Types.Number, default: 0 }
}
```

#### Velocity Component
```javascript
Velocity.schema = {
  x: { type: ECSY.Types.Number, default: 0 },
  y: { type: ECSY.Types.Number, default: 0 },
  z: { type: ECSY.Types.Number, default: 0 },
  maxSpeed: { type: ECSY.Types.Number, default: 5 }
}
```

#### Genetics Component
```javascript
Genetics.schema = {
  size: { type: ECSY.Types.Number, default: 1 },        // 0.8-1.6 range
  speed: { type: ECSY.Types.Number, default: 5 },       // 4-8 range  
  metabolism: { type: ECSY.Types.Number, default: 1 },  // 0.8-1.2 range
  color: { type: ECSY.Types.Ref, default: [100, 180, 255] } // RGB array
}
```

#### Health Component
```javascript
Health.schema = {
  current: { type: ECSY.Types.Number, default: 100 },
  max: { type: ECSY.Types.Number, default: 100 },
  regenRate: { type: ECSY.Types.Number, default: 0.1 }
}
```

#### Behavioral Components
- **Hunger**: Tracks feeding needs and consumption rates
- **Age**: Manages lifecycle with maturity and death thresholds
- **Behavior**: Social preferences and personality traits
- **PredatorState**: Hunting modes and aggression levels

#### Tag Components
Entity type identification using empty marker components:
- `FishTag`, `SharkTag`, `CrabTag` (Entities)
- `FoodTag`, `SeaweedTag`, `CoralTag`, `DebrisTag` (Environment)

### Entity Composition Examples

**Fish Entity**:
```
Fish = Position + Velocity + Health + Age + Hunger + 
       Behavior + Genetics + Renderable + FishTag
```

**Shark Entity**:
```
Shark = Position + Velocity + Health + Age + 
        PredatorState + Renderable + SharkTag
```

**Food Particle**:
```
Food = Position + Renderable + FoodTag
```

## System Processing Pipeline

### Execution Order
Systems execute in a specific order each frame to ensure proper data flow:

1. **SpatialHashSystem** - Builds spatial grid for neighbor detection
2. **BabylonMeshSystem** - Manages 3D mesh creation and visual updates
3. **FoodSpawnerSystem** - Generates food particles based on configuration
4. **HungerSystem** - Updates hunger states and triggers feeding behaviors
5. **BreedingSystem** - Handles reproduction and offspring generation
6. **SharkSystem** - Processes predator hunting and attack behaviors
7. **WanderSystem** - Applies random movement to prevent stagnation
8. **SchoolingSystem** - Calculates flocking forces (boids algorithm)
9. **MovementSystem** - Updates entity positions based on velocity
10. **RenderSystem** - Synchronizes visual representation with logical state

### Key System Specifications

#### SchoolingSystem (Boids Algorithm)
```javascript
// Implements simplified boids with cohesion and separation
neighborRadius: 6,           // Distance to consider neighbors
separationDistance: 1.2,     // Minimum distance to maintain
weightCohesion: 0.8,        // Pull toward group center
weightSeparation: 1.2       // Push away from close neighbors
```

#### FoodSpawnerSystem
```javascript
// Configurable food generation
spawnInterval: 1000,         // Check every 1 second
spawnMinCount: 1,           // Minimum spawned per cycle
spawnMaxCount: 3,           // Maximum spawned per cycle
maxFoodCount: 50            // Total food limit in scene
```

#### SpatialHashSystem
```javascript
// Efficient neighbor detection
gridSize: configurable,      // Cell size for spatial partitioning
getEntitiesNear(position, radius, tagFilter) // O(1) neighbor queries
```

## Configuration Management

### Simulation Configuration (`config/simulation_config.js`)

The simulation is driven by a comprehensive configuration object:

```javascript
const SimulationConfig = {
  entities: {
    fish: {
      count: 30,
      spawnHeight: 5,
      maxSpeed: 8,
      maxForce: 1,
      neighborhoodRadius: 5,
      schoolingDistance: 2,
      updateInterval: 2
    },
    crabs: {
      count: 8,
      spawnHeight: 0.1,
      maxSpeed: 2,
      maxForce: 0.5,
      neighborhoodRadius: 5,
      waitDurationRange: { min: 3, max: 5 },
      updateInterval: 2
    }
  },
  food: {
    maxParticles: 50,
    spawnInterval: 1000,
    daySpawnRate: 15,        // Particles per minute during day
    nightSpawnRate: 5,       // Particles per minute during night
    lifetime: {
      min: 20000,            // Minimum lifetime in milliseconds
      max: 30000             // Maximum lifetime in milliseconds
    }
  },
  world: {
    bounds: {
      minX: -50, maxX: 50,
      minY: 0, maxY: 30,
      minZ: -50, maxZ: 50
    }
  },
  graphics: {
    shadows: {
      enabled: true,
      resolution: 1024,
      updateInterval: 5
    },
    postProcessing: {
      bloomEnabled: true,
      bloomKernel: 32
    },
    fog: {
      dayDensity: 0.02,
      nightDensity: 0.03
    }
  },
  debug: {
    showNavMesh: false,
    logSpawnPositions: false,
    showFPS: true
  }
}
```

## Game Mechanics

### Core Energy System
- **Scale**: 0-100 (unified health/hunger resource)
- **Depletion**: Metabolism rate + movement cost
- **Replenishment**: Consuming food particles
- **Behavioral Thresholds**:
  - Food-seeking: Energy < 50
  - Breeding eligible: Energy > 80
  - Death: Energy = 0

### Breeding Mechanics
Adult fish can reproduce when:
1. Energy > 80
2. Age >= maturityAge (60 game units)
3. Suitable mate within range
4. Cooldown period elapsed (30 seconds)

### Genetic System
Traits inherited with variation:
- **Size**: 0.8-1.6 multiplier affecting visual scale
- **Speed**: 4-8 units determining maximum velocity
- **Metabolism**: 0.8-1.2 rate affecting energy consumption
- **Color**: RGB array with genetic variation

### Lifecycle Management
- **Juvenile**: Age < maturityAge (cannot breed)
- **Adult**: Age >= maturityAge (can breed if energy sufficient)
- **Death**: Age > maxAge OR Health <= 0

## Environmental Systems

### Day-Night Cycle
**Time Management**:
```javascript
timeScale: 1200,             // 1 real second = 20 game minutes
gameTime: 8 * 60,           // Start at 8:00 AM
SUNRISE_HOUR: 6,
SUNSET_HOUR: 18
```

**Dynamic Effects**:
- Sun/moon positioning with realistic orbits
- Color temperature shifts (warm day → cool night)
- Shadow quality adjustment (higher during day)
- Fog density changes
- Volumetric lighting effects

**Behavioral Impact**:
- Reduced food spawning during night
- Modified movement patterns
- Lighting affects visibility and behaviors

### Environmental Elements

**Static Environment**:
- **Coral Formations** (`coral.js`) - Shelter and navigation landmarks
- **Seaweed Beds** (`seaweed.js`) - Movement obstacles and cover
- **Ocean Debris** (`ocean_debris.js`) - Environmental variety
- **Landscape** (`landscape.js`) - Ocean floor topology

**Dynamic Elements**:
- **Food Particles** - Spawned based on time and population
- **Crabs** (`crab.js`) - Bottom-dwelling entities with simple AI

## Rendering & Visual Systems

### 3D Asset Pipeline
**Fish Models** (Priority order):
1. Remote GLB: Barramundi fish from Khronos glTF samples
2. Local fallback: `models/fish.gltf`
3. Procedural mesh: Capsule body + cylinder tail + fins
4. Final fallback: Simple sphere primitive

**Material System**:
- Cached materials for genetic color variations
- Standard materials with diffuse coloring
- Genetic color application: RGB values mapped to material.diffuseColor

### Visual Effects
- **Shadows**: Dynamic quality (1024px night, 2048px day)
- **Post-processing**: Bloom effects, chromatic aberration
- **Fog**: Depth-based atmospheric rendering
- **Volumetric lighting**: God rays and underwater lighting

### Performance Optimizations
- **Instance rendering**: Shared geometries for similar entities
- **Level of detail**: Reduced complexity for distant objects
- **Frustum culling**: Skip rendering for off-screen entities
- **Update intervals**: Different systems update at varying frequencies

## User Interface & Interaction

### Current UI Systems
- **UIManager** (`core/UIManager.js`) - Main interface controller
- **Entity Inspector** - Click-to-inspect entity statistics
- **FPS Display** - Performance monitoring
- **Food Dropping** - Click to spawn food at location

### Planned Interactions
- **Entity Selection** - Detailed genetic and behavioral data
- **Time Controls** - Speed up/slow down simulation
- **Camera Controls** - Free-look and follow modes
- **Environment Controls** - Toggle day/night, weather effects

## Error Handling & Reliability

### Error Management Strategy
**Higher-Order Functions** (`utils/errorHandling.js`):
```javascript
withErrorHandler(function, context) // Wraps functions with try-catch
```

**Custom Exceptions** (`utils/exceptions.js`):
- `SimulationError` - General simulation failures
- `ComponentMissingError` - ECS component access issues
- Hierarchical error types for specific failure modes

### Graceful Degradation
- Asset loading failures fall back to simpler alternatives
- Advanced graphics features disable on unsupported hardware
- System failures logged without crashing entire simulation

## File Structure & Organization

```
Fish_Evo/
├── index.html                 # Application entry point
├── package.json              # Dependencies and scripts
├── config/
│   └── simulation_config.js  # Global configuration
├── core/                     # Core simulation management
│   ├── Camera.js            # Camera setup and controls
│   ├── Scene.js             # Babylon.js scene initialization
│   ├── Simulation.js        # Main ECS world management
│   ├── UIManager.js         # User interface controller
│   └── start-ecs.js         # ECS bootstrap module
├── ecs/                     # Entity-Component-System
│   ├── components/          # Data containers
│   │   ├── Position.js      # 3D coordinates
│   │   ├── Velocity.js      # Movement vectors
│   │   ├── Genetics.js      # Hereditary traits
│   │   ├── Health.js        # Life points
│   │   ├── Hunger.js        # Feeding needs
│   │   ├── Age.js           # Lifecycle tracking
│   │   ├── Behavior.js      # Social preferences
│   │   ├── PredatorState.js # Hunting behavior
│   │   ├── Renderable.js    # Visual properties
│   │   └── Tags.js          # Entity type markers
│   ├── entities/            # Factory classes
│   │   ├── FishFactory.js   # Fish entity creation
│   │   ├── FoodFactory.js   # Food particle creation
│   │   └── SharkFactory.js  # Predator creation
│   └── systems/             # Logic processors
│       ├── BabylonMeshSystem.js    # 3D mesh management
│       ├── MovementSystem.js       # Position updates
│       ├── SchoolingSystem.js      # Boids behavior
│       ├── HungerSystem.js         # Feeding logic
│       ├── BreedingSystem.js       # Reproduction
│       ├── SharkSystem.js          # Predation
│       ├── FoodSpawnerSystem.js    # Food generation
│       ├── SpatialHashSystem.js    # Neighbor detection
│       ├── WanderSystem.js         # Random movement
│       └── RenderSystem.js         # Visual updates
├── utils/                   # Utility functions
│   ├── errorHandling.js     # Error wrapper functions
│   └── exceptions.js        # Custom error types
├── models/                  # 3D assets
│   └── README.md           # Asset documentation
├── memory-bank/            # Documentation
│   ├── architecture.md     # Technical architecture
│   ├── game-mechanics.md   # Gameplay rules
│   └── [other docs]        # Design documents
├── Day-Night_Cycle.js      # Environmental lighting
├── coral.js                # Coral reef generation
├── crab.js                 # Crab entity behaviors
├── landscape.js            # Ocean floor terrain
├── ocean_debris.js         # Environmental objects
└── seaweed.js              # Plant life generation
```

## Development & Deployment

### Development Setup
```bash
# Install dependencies
npm install

# Start development server
npm start
# Serves on http://localhost:8080
```

### Build Process
- **No build step**: Direct file serving for development
- **Asset loading**: Dynamic loading of 3D models via Babylon.js loaders
- **Module system**: ES6 imports handled by modern browsers

### Deployment Requirements
- **Static hosting**: Can be deployed to any static file server
- **WebGL support**: Target browsers must support WebGL 2.0
- **CORS**: 3D model loading may require CORS configuration

### Performance Considerations
- **Entity limits**: Current configuration supports ~50-100 entities
- **Spatial optimization**: Hash grid reduces collision detection complexity
- **Rendering optimization**: LOD and culling for better frame rates
- **Update frequency**: Systems run at different intervals to balance performance

## Testing Strategy

### Current State
- **Manual testing**: Visual observation of simulation behavior
- **Debug features**: FPS monitoring, console logging
- **Configuration**: Debug flags in `SimulationConfig.debug`

### Recommended Testing Approach

**Unit Testing**:
- Component schema validation
- System logic verification
- Mathematical calculations (genetics, movement)
- Factory entity creation

**Integration Testing**:
- ECS system interactions
- Babylon.js scene integration
- Asset loading robustness

**Performance Testing**:
- Frame rate analysis with varying entity counts
- Memory usage monitoring
- Spatial hash efficiency validation

**Visual Testing**:
- Behavior correctness through observation
- Genetic trait inheritance validation
- Environmental effect accuracy

## Extension Points & Future Development

### Planned Features
- **Advanced AI**: More sophisticated predator hunting patterns
- **Environmental Interaction**: Fish reacting to coral and seaweed
- **Save/Load System**: Persistent simulation states
- **Advanced Genetics**: Multi-trait inheritance and mutations
- **Weather Systems**: Storms, currents, temperature zones

### Extension Architecture
The ECS design enables easy feature addition:

1. **New Components**: Add data containers for new traits
2. **New Systems**: Implement logic processors for new behaviors
3. **New Entities**: Create factory classes for new species
4. **New Interactions**: Combine existing components in novel ways

### Plugin System (Future)
- Modular system loading
- Configuration-driven feature enabling
- Third-party behavior plugins

## Conclusion

Fish_Evo represents a well-architected simulation framework that balances performance, extensibility, and visual appeal. The ECS architecture provides a solid foundation for complex emergent behaviors while maintaining clean separation of concerns. The comprehensive configuration system allows for easy experimentation with different ecological parameters, making it valuable for both educational and research applications.

The simulation successfully demonstrates:
- **Emergent Behavior**: Complex interactions arising from simple rules
- **Genetic Evolution**: Hereditary traits affecting survival and reproduction  
- **Ecological Dynamics**: Predator-prey relationships and resource competition
- **Visual Appeal**: Immersive 3D underwater environment with realistic lighting

Future development should focus on expanding the behavioral complexity while maintaining the clean architectural patterns established in the current implementation.