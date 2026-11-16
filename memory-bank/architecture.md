# Target Architecture: Fish Evolution Simulation

## Overview

The simulation will be built using an **Entity-Component-System (ECS)** architecture to promote modularity, flexibility, and performance.

## Core Principles

*   **Composition over Inheritance:** Entity behavior and characteristics will be defined by composing Components, rather than through deep inheritance hierarchies.
*   **Data-Oriented Design:** Logic (Systems) will operate on data (Components) based on entity queries, improving cache efficiency and simplifying system logic.
*   **Separation of Concerns:**
    *   **Entities:** Simple identifiers.
    *   **Components:** Plain data objects holding state (e.g., `Position`, `Velocity`, `Hunger`, `Renderable`). Stored likely in `ecs/components/`.
    *   **Systems:** Contain the application logic, operating on entities possessing specific sets of components (e.g., `MovementSystem`, `HungerSystem`, `RenderSystem`). Stored likely in `ecs/systems/`.

## ECS Implementation

*   **Primary Architecture:** Utilizes the **`ecsy`** library (global `window.ECSY`) for ECS world, components, and systems. Babylon.js provides rendering and scene management.
*   **Bootstrap:** `index.html` loads Babylon and ECSY; `core/Scene.js` initializes the Babylon scene; `core/start-ecs.js` starts `core/Simulation.js` once the scene is ready.

## Entity Management

*   Entities are created via **Entity Factories** in `ecs/entities/*` (e.g., `FishFactory`, `FoodFactory`, `SharkFactory`). Legacy classes like `fish.js` and `shark.js` have been removed.

## Error Handling

*   **Higher-Order Functions (HOFs):** Error checking (e.g., `try...catch`, validation) for critical system logic will be encapsulated within HOFs located in a dedicated utility module (e.g., `utils/errorHandling.js`).
*   **Custom Exceptions:** A hierarchy of custom exceptions (e.g., `SimulationError`, `ComponentMissingError`) will be defined (e.g., in `utils/exceptions.js`) to provide specific error information.

## Data Flow (High-Level)

1.  **Initialization:** Create ECS world, register components and systems, create initial entities (landscape, initial fish population) using factories/archetypes.
2.  **Game Loop:**
    *   Execute ECS systems in a defined order (e.g., Input -> AI -> Physics/Movement -> Rendering).
    *   Systems query for relevant entities and update their components.
    *   Handle entity creation/deletion based on system logic (e.g., breeding, starvation).
3.  **Rendering:** `BabylonMeshSystem` creates/clones meshes (loads `models/fish.gltf` for fish template and falls back to a sphere), while `RenderSystem` syncs `Position` to mesh transforms.

## Finalized ECS Wiring

1. Bootstrap
   - `index.html` includes Babylon, GUI, Recast, ECSY. It loads `core/Scene.js`, then `core/start-ecs.js` (ES module) to start the ECS `Simulation`.
   - `core/Scene.js` sets up camera, post effects, day/night, terrain, coral, debris, seaweed and exposes `window.sceneManager`.

2. Simulation
   - `core/Simulation.js` creates the ECS world, registers components/systems, applies configuration from `window.SimulationConfig`, creates initial entities, and runs the loop (`world.execute`).

3. Systems
   - `SpatialHashSystem` for proximity.
   - `BabylonMeshSystem` for mesh creation and material/color application; ensures `mesh.entity` is set for picking.
   - `FoodSpawnerSystem`, `HungerSystem`, `BreedingSystem`, `SharkSystem`, `MovementSystem`, `RenderSystem` for behaviors and transforms.

4. UI
   - `core/UIManager.js` provides HUD and inspector for ECS entities using `mesh.entity` mapping.

## Components (Schema)

- `Position { x, y, z }`
- `Velocity { x, y, z, maxSpeed }`
- `Renderable { model, scale, visible }`
- `Health { current, max, regenRate, isDead? }`
- `Age { value, maturityAge, maxAge, isAdult? }`
- `Hunger { value, rate }`
- `Behavior { schoolingPreference, personalSpace, isHungry?, lastBreedTime?, breedCooldown? }`
- `Genetics { size, speed, metabolism, color:[r,g,b] }`
- `PredatorState { lastBiteTime, biteCooldown }`
- Tags: `FishTag`, `SharkTag`, `CrabTag`, `FoodTag`, `SeaweedTag`, `CoralTag`, `DebrisTag`

## Configuration

`config/simulation_config.js` exposes `window.SimulationConfig` used by `core/Scene.js` and injected into systems via `Simulation.initialize` (e.g., `FoodSpawnerSystem.updateConfig`).

## Removed Legacy Code

Removed redundant YUKA/manager scripts in favor of ECS-only runtime:
`entities/entity_handler.js`, `fish.js`, `shark.js`, `food_spawner.js`, `food.js`, `inspector.js`, `models/fish/BasicFish.js`.
