## Refactor Plan: Consolidate to ECS Architecture

### Objectives
- Migrate runtime responsibilities to the ECS stack (`ecsy`) for composition over inheritance.
- Remove redundant legacy systems (YUKA-based managers and particle food) that duplicate ECS behavior.
- Centralize configuration in `config/simulation_config.js` and inject into ECS systems.
- Preserve current visuals and controls; improve maintainability and testability.

### Scope Summary
- Keep: `ecs/components/*`, `ecs/entities/*`, `ecs/systems/*`, `core/Simulation.js`, `core/Camera.js`, `core/UIManager.js`, `core/Scene.js` (as Babylon scene bootstrap), `utils/*`, `config/simulation_config.js`.
- Remove/replace: `entities/entity_handler.js`, `fish.js`, `food.js`, `food_spawner.js`, `shark.js`, `inspector.js`, `models/fish/BasicFish.js` (unless explicitly used).
- Update: `index.html` script includes; `core/Scene.js` to hand off to ECS `Simulation` instead of legacy handlers.

### Phases
1) Preparation
- Fix small ECS bugs and align picking:
  - In `ecs/systems/BabylonMeshSystem.js` shark creation, replace `renderable.model.entity = entity;` with `rend.model.entity = entity;`.
  - Ensure all `Renderable.model` meshes store `entity` for picking.
- Add system config plumbing:
  - Read spawn intervals/max counts from `SimulationConfig` in `FoodSpawnerSystem` via `Simulation.initialize`.

2) Entry/Bootstrap Simplification
- `index.html`: remove legacy script tags for `fish.js`, `food.js`, `food_spawner.js`, `shark.js`, `inspector.js`, `entities/entity_handler.js`.
- Ensure `core/Scene.js` is loaded and, after scene setup, instantiates `Simulation` and calls `initialize(scene)`.

3) Scene Hand-off and Loop Ownership
- In `core/Scene.js`:
  - Remove per-frame updates for `entityHandler`, `sharkHandler`, `foodSpawner` (legacy paths).
  - Keep rendering loop only. ECS `Simulation` drives game logic via `world.execute`.
  - Keep day/night, landscape, coral, debris as visual environment. If any of these need ECS entities later, add dedicated factories/systems.

4) UI Consolidation
- Remove `inspector.js`. Use `core/UIManager.js` as the single HUD/inspector:
  - UI picks `Renderable.model` via stored `entity` references.
  - Show ECS stats (`world.stats`), selected entity components.

5) Entity and System Consolidation
- Fish: Keep `FishFactory`, ECS components (`Position`, `Velocity`, `Health`, `Age`, `Hunger`, `Behavior`, `Genetics`, `FishTag`).
- Movement/Render: Keep `MovementSystem`, `RenderSystem`, `BabylonMeshSystem`.
- Hunger/Breeding: Keep `HungerSystem`, `BreedingSystem`.
- Sharks: Keep `SharkFactory`, `SharkSystem`; remove `shark.js` and `SharkHandler`.
- Food: Keep `FoodFactory`, `FoodSpawnerSystem`; remove `food.js` and `food_spawner.js`.
- Spatial queries: Keep `SpatialHashSystem`.

6) Configuration Centralization
- Move hardcoded ECS values into `config/simulation_config.js`:
  - Food spawn intervals/min/max counts/maxFoodCount.
  - World bounds for `MovementSystem` (or inject via system options if needed).
  - Initial entity counts for fish/sharks.
- Pass values from `Simulation.initialize()` into systems via setters (e.g., `FoodSpawnerSystem.updateConfig`).

7) Assets and Models
- Decide fish mesh source:
  - Option A: Keep procedural meshes in `BabylonMeshSystem` (current default).
  - Option B: Load `models/fish.gltf` within `BabylonMeshSystem` and clone for instances.
- If Option A: remove `models/fish/BasicFish.js` and update `models/README.md`.
- If Option B: implement glTF load once in `setScene()` and cache template.

8) Removal of Legacy Code
- Delete files (ensure git history retains them):
  - `entities/entity_handler.js`
  - `fish.js`
  - `shark.js`
  - `food_spawner.js`
  - `food.js`
  - `inspector.js`
  - `models/fish/BasicFish.js` (unless retained by decision in Phase 7)

### Error Handling & Exceptions
- Continue using `utils/errorHandling.js` HOFs (`withErrorHandler`) in systems with IO/creation logic (`FoodSpawnerSystem`, `Simulation` lifecycle).
- Keep custom exception types in `utils/exceptions.js` for future validation.

### Testing & Acceptance Criteria
- Build smoke test: page loads with no missing scripts; no console errors.
- Visual parity: fish and sharks appear; food spawns; predators chase/bite; HUD shows entity counts and FPS.
- Input: clicking meshes selects ECS entities via `UIManager`; no conflicting pointer handlers.
- Performance: stable FPS with default counts; no memory growth on entity removal.

### Migration Checklist
- [ ] Fix `BabylonMeshSystem` shark `renderable` variable bug
- [ ] Wire `SimulationConfig` into `Simulation.initialize` → `FoodSpawnerSystem.updateConfig`
- [ ] Update `index.html` script list (remove legacy)
- [ ] Update `core/Scene.js` to instantiate `Simulation` and remove legacy per-frame updates
- [ ] Remove `inspector.js` and ensure `UIManager` is active
- [ ] Remove legacy entity/food/shark files
- [ ] Decide fish mesh source; remove unused model code/docs accordingly
- [ ] Sanity pass for imports and linter

### Risks & Mitigations
- Risk: Hidden dependencies from legacy scripts (e.g., global state or scene properties).
  - Mitigation: Search for remaining references; run in dev and watch console; add guards in `UIManager`.
- Risk: Visual regressions (particle-based food aesthetic).
  - Mitigation: Enhance ECS food mesh/material in `BabylonMeshSystem` to mimic prior look if desired.
- Risk: Picking fails if `Renderable.model.entity` not set.
  - Mitigation: Add unit/integration check in `BabylonMeshSystem.execute` for all new meshes.

### Timeline (rough)
- Day 1: Bug fixes, config plumbing, entrypoint cleanup
- Day 2: Scene handoff, UI consolidation, remove legacy files
- Day 3: Asset decision, polish meshes, testing and docs

### Post-Refactor Actions
- Update `memory-bank/architecture.md` to reflect finalized ECS-only runtime and system configuration.
- Update `memory-bank/progress.md` with milestones completed.
