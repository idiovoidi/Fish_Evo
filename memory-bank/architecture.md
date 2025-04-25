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

## Proposed ECS Implementation

*   **Primary Recommendation:** Utilize the **`ecsy`** library (https://github.com/ecsyjs/ecsy). This provides a robust, performant, and well-structured framework for ECS in JavaScript.
*   **Fallback:** If `ecsy` proves unsuitable after evaluation, a custom ECS framework will be implemented following the core principles above, with dedicated modules for components, systems, and entity management/factories.

## Entity Management

*   Existing entity classes (e.g., `fish.js`) will be refactored into **Entity Factories** or **Archetypes**. These will be functions or configurations responsible for creating new entities and attaching the necessary initial set of components.

## Error Handling

*   **Higher-Order Functions (HOFs):** Error checking (e.g., `try...catch`, validation) for critical system logic will be encapsulated within HOFs located in a dedicated utility module (e.g., `utils/errorHandling.js`).
*   **Custom Exceptions:** A hierarchy of custom exceptions (e.g., `SimulationError`, `ComponentMissingError`) will be defined (e.g., in `utils/exceptions.js`) to provide specific error information.

## Data Flow (High-Level)

1.  **Initialization:** Create ECS world, register components and systems, create initial entities (landscape, initial fish population) using factories/archetypes.
2.  **Game Loop:**
    *   Execute ECS systems in a defined order (e.g., Input -> AI -> Physics/Movement -> Rendering).
    *   Systems query for relevant entities and update their components.
    *   Handle entity creation/deletion based on system logic (e.g., breeding, starvation).
3.  **Rendering:** A dedicated `RenderSystem` queries entities with `Renderable` and `Position` components (and others as needed) to draw them on screen (likely using HTML5 Canvas or WebGL, specific library TBD).
