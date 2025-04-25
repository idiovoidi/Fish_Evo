# Implementation Plan: Fish Evolution Simulation

## 1. Project Overview

Based on the file structure and names (`fish.js`, `shark.js`, `crab.js`, `seaweed.js`, `food.js`, `food_spawner.js`, `landscape.js`, `coral.js`, `ocean_debris.js`, `Day-Night_Cycle.js`), this project appears to be an aquatic ecosystem simulation or game, potentially focusing on evolution (`Fish_Evo` workspace name). It seems to utilize an Entity-Component-System (ECS) approach (presence of an `ecs/` directory) and possibly AI (`ai/` directory) for entity behavior.

## 2. Current State Analysis

*   **Core Entities:** Code exists for various entities (Fish, Shark, Crab, Seaweed, Coral, Debris, Food) - likely implemented as classes currently.
*   **Environment:** Includes landscape generation (`landscape.js`) and a day-night cycle (`Day-Night_Cycle.js`).
*   **Core Systems:** Likely includes systems for spawning (`food_spawner.js`), entity behavior (potentially in `ai/` or individual entity files), and rendering (implied by `index.html`). Integration and separation of concerns need assessment.
*   **Architecture:** Seems to be a mix of object-oriented programming (individual JS files per entity) and potentially a custom ECS. The effectiveness and scalability of the current `ecs/` implementation are unclear.
*   **Dependencies:** Uses Node.js (`package.json`, `node_modules/`). Specific JS libraries in use need review.
*   **Testing:** Some test files exist (`seaweed_test.html`, `shark_test.html`, `shark_test.js`), but coverage is likely limited and needs expansion, especially post-refactoring.
*   **Documentation:** Core documents (`architecture.md`, `progress.md`, `tech-stack.md`) are currently empty. `game-design-document.md` has initial content.

## 3. Proposed Implementation Steps & Refactoring

The primary goal is to establish a robust, modular, and scalable architecture (likely ECS) before adding complex features.

### Phase 1: Assessment & Architecture Definition

**Status: Completed** (Initial assessment done, target architecture defined. Detailed code review continues iteratively during Phase 2).

1.  **Detailed Code Review:**
    *   Analyze key files (`fish.js`, `shark.js`, etc.) and directories (`ecs/`, `core/`, `ai/`) to understand current implementation, interactions, inheritance patterns, and data flow.
    *   Identify core systems (e.g., movement, collision, eating, breeding, AI decision-making) and how they are currently implemented.
    *   Assess the current state, suitability, and potential limitations of the `ecs/` implementation.
    *   Evaluate potential performance bottlenecks and scalability concerns, especially regarding entity management and system processing.
    *   **Status:** Decided on **`ecsy`**. Fallback is custom implementation.
    *   Determine how existing entity files (`fish.js`, etc.) will map to the chosen ECS structure (e.g., as entity factories/archetypes defining component sets).
2.  **Define Target Architecture (ECS):**
    *   **Recommendation:** Evaluate and plan to adopt the `ecsy` library (https://github.com/ecsyjs/ecsy).
    *   **Fallback:** If `ecsy` is unsuitable, define a clear custom ECS structure (e.g., distinct `components/`, `systems/`, and entity factory modules/functions).
3.  **Establish Documentation:**
    *   **Status:** `architecture.md` and `tech-stack.md` populated with initial target details. `game-design-document.md` updated.
    *   Populate `memory-bank/architecture.md` with the **chosen target architecture** (ECS library or custom structure), key design patterns, data flow, and component/system organization.
    *   Populate `memory-bank/tech-stack.md` with key libraries (`ecsy` if chosen, rendering library if any, etc.).
    *   Continue refining `memory-bank/game-design-document.md` as needed.

### Phase 2: Core Refactoring & Foundation Building

**Status: In Progress**

**Priority:** Implement the target ECS structure defined in Phase 1.

1.  **Implement/Integrate ECS:**
    *   **Status:** `ecsy` installed, directory structure (`ecs/components`, `ecs/systems`, `utils`) created.
    *   Set up `ecsy` world and basic simulation loop.
    *   Define core components (`Position`, `Velocity`, `Hunger`, `Renderable`, etc.) based on Phase 1 analysis.
2.  **Refactor Core Entities & Systems:**
    *   Convert existing entity classes (`fish.js`, etc.) into entity factories/archetypes within the ECS framework.
    *   Break down monolithic entity logic into distinct ECS Systems (e.g., `MovementSystem`, `HungerSystem`, `BreedingSystem`, `CollisionSystem`). Prioritize systems essential for core mechanics defined in the GDD.
    *   Replace inheritance with composition using ECS components.
3.  **Implement Centralized Error Handling:**
    *   Create a dedicated JS utility module (e.g., `utils/errorHandling.js`).
    *   Define **Higher-Order Functions (HOFs)** for wrapping critical functions/systems with error checking (e.g., `try...catch`, basic validation).
    *   Apply these HOFs judiciously to core system logic.
4.  **Establish Exception Hierarchy:**
    *   Create a base custom exception class (e.g., `SimulationError` in `utils/exceptions.js`).
    *   Define and use specific exception subclasses (e.g., `EntityNotFoundError`, `ComponentMissingError`).

**Definition of Done for Phase 2:**
*   Chosen ECS framework (`ecsy` or custom) is implemented and integrated.
*   Core entities (e.g., Fish) are created and managed via the ECS framework (archetypes/factories exist).
*   Key systems identified in Phase 1 (e.g., Movement, Hunger) are refactored into distinct ECS systems operating on components.
*   Obvious inheritance patterns are replaced by composition via components.
*   Basic error handling HOFs and custom exception hierarchy are implemented and used in refactored systems.
*   The simulation runs with basic core mechanics (movement, spawning, simple hunger) using the new ECS structure.

### Phase 3: Feature Development (Based on Game Design Document)

*   Incrementally implement features outlined in `game-design-document.md` **on top of the refactored ECS architecture**. Examples:
    *   Detailed breeding mechanics.
    *   Evolution mechanics (requiring Genetics components/systems).
    *   Predator AI (Shark behavior system).
    *   Environmental interactions.
    *   User interaction/control systems.
*   Ensure new features align with the ECS pattern (new components, systems).

### Phase 4: Testing and Refinement

*   Expand unit and integration tests (using a JS testing framework like Jest or Mocha) to cover refactored systems, components, and new features. Aim for clear test coverage goals.
*   Profile and optimize performance, leveraging ECS capabilities where possible.
*   Refine simulation parameters and game balance based on testing and observation.
*   Update `memory-bank/progress.md` regularly.

## 4. Next Immediate Actions

1.  **Begin Phase 1:** Start the detailed code review (`fish.js`, `ecs/`, `core/`, `ai/`).
2. **Evaluate ECS:** Research `ecsy` more thoroughly in the context of the existing code. Decide on `ecsy` vs. custom structure.
3. **Document Architecture:** Start populating `memory-bank/architecture.md` with the chosen target structure.
