# Code Smells – Fish Evo

Findings from a pass over the ECS simulation codebase. Ordered by impact (bugs and architecture first).

**Status:** Addressed in a refactor: missing Health import, SpatialHash import order, config indentation, shared velocity/logger/emissive helpers, death in DeathSystem only, ESM model imports, UIManager injection and no global, withTimeout renamed to withSlowOperationWarning.

---

## 1. Bugs / Missing imports

### BreedingSystem.js – uses `Health` but does not import it
- **Where:** Lines 36 and 54 use `e1.getComponent(Health)` and `e2.getComponent(Health)`.
- **Issue:** `Health` is not in the import list. This will throw at runtime when breeding runs (or rely on a global if one exists).
- **Fix:** Add `import { Health } from '../components/Health.js';`.

---

## 2. Global / window coupling

### Simulation.js
- Reads `window.SimulationConfig` in `initialize()` and `createInitialEntities()`.
- Assigns `window.uiManager = this.uiManager` for button callbacks.
- **Issue:** Tight coupling to browser globals; harder to test and reuse.

### UIManager.js
- Inspector buttons use `onclick="window.uiManager.toggleTracking()"` etc.
- **Issue:** Depends on global `window.uiManager`; breaks if UIManager is not the global.
- **Suggestion:** Attach handlers in JS (e.g. `addEventListener`) and pass callbacks or a single `uiManager` reference.

### UIManager – component lookup by string
- `this.simulation.world.getComponent('Position')` with fallback to `window.Position`.
- **Issue:** Stringly-typed API; `window.Position` is undefined in a module-only setup.
- **Suggestion:** Import component types (e.g. `Position`, `Renderable`) and pass them in or resolve via a small registry that doesn’t rely on globals.

### MovementSystem.js, Simulation.js
- Config comes from `window.SimulationConfig`.
- **Suggestion:** Inject config (e.g. in `init()` or constructor) so systems don’t read from `window`.

### config/simulation_config.js
- Mutates `window.SimulationConfig`.
- **Suggestion:** Export a single config object; let the bootstrap (e.g. `Simulation` or `start-ecs`) assign to `window` if needed for legacy scripts.

---

## 3. Undeclared dependencies (implicit globals)

### BabylonMeshSystem.js
- Calls `createFishModel(this.scene)`, `createFoodModel(this.scene)`, `createSharkModel(this.scene)`, `createCrabModel(this.scene)` with no import.
- **Issue:** Relies on these being on the global object (from script tags in `index.html`). Breaks in a pure-ESM build; unclear dependencies.
- **Fix:** Import from `models/fish_model.js`, `models/food_model.js`, etc., and pass them into the system or a factory.

---

## 4. Duplicated logic

### Velocity clamping (speed limit / min speed)
- **SchoolingSystem.js** (lines ~124–134), **WanderSystem.js** (lines ~46–56), **FoodConsumptionSystem.js** (lines ~105–112) each implement “clamp to max speed” and/or “boost to min speed” with similar math.
- **Suggestion:** Extract a shared helper, e.g. `clampVelocity(velocity, { maxSpeed, minSpeedFactor })`, in a small `utils/velocity.js` (or similar) and use it from all three systems.

### Emissive color update in RenderSystem.js
- In `updateFishVisualState()`, the same pattern is repeated three times (starving / hungry / well-fed): “if child meshes, loop and set emissiveColor; else set on model.material”.
- **Suggestion:** Extract e.g. `setEmissiveOnRenderable(renderable, r, g, b)` that encapsulates the child-vs-root logic and call it for each state.

### Map-based animation tick (death / breeding / eating)
- **DeathSystem**, **BreedingSystem**, and **FoodConsumptionSystem** each keep a `Map` of entity → `{ startTime, duration, ... }` and tick animations in `execute()`.
- **Suggestion:** Shared “entity animation runner” utility or a small `EntityAnimationSystem` that accepts “animation definition” callbacks to avoid repeating the same loop and cleanup pattern.

### Distance / vector math
- `getDistance(pos1, pos2)` exists in FoodConsumptionSystem; elsewhere (SchoolingSystem, BreedingSystem, etc.) `dx, dy, dz`, `distSq`, `dist` are inlined repeatedly.
- **Suggestion:** Centralize in a tiny math/position helper (e.g. `distanceSq(a, b)`, `distance(a, b)`, `normalize(dx,dy,dz)`) and use it across systems.

---

## 5. Single Responsibility / mixed concerns

### HungerSystem.js
- Increases hunger, updates `Behavior.isHungry`, applies starvation damage, sets `Health.isDead`, **and** sets sinking velocity (`velocity.x = 0; velocity.y = -0.5; …`).
- **Issue:** Death and “sinking” behavior are spread between HungerSystem and DeathSystem; velocity mutation for death is in HungerSystem.
- **Suggestion:** Keep hunger and starvation damage in HungerSystem; move “mark dead + set sinking velocity” into DeathSystem (or a single “death handling” path) so death behavior lives in one place.

### UIManager.js
- One class handles: HUD, inspector DOM, entity selection, highlight mesh, camera tracking, continuous inspector updates, and cleanup.
- **Suggestion:** Split into smaller units (e.g. HUD updater, Inspector panel, SelectionHighlight, CameraTracking) and compose them in UIManager to improve testability and clarity.

---

## 6. Magic numbers

- **RenderSystem:** e.g. speed threshold `0.1`, hunger thresholds `0.8` / `0.5`, pitch `0.3`, banking `0.2`, pulse period `500`.
- **SchoolingSystem:** radii `8`, `2.5`, `6`, `4`, weights `0.7`, `0.6`, `2.5`, `1.0`, `0.3`, `0.8`, `0.1`, `0.3`.
- **WanderSystem:** `1.2`, `0.3`, `0.5`, depth bounds `25` / `2`.
- **HungerSystem:** `0.4`, `0.7`, `0.3`, damage factor `3`, regen `0.1`.
- **BreedingSystem:** `BREED_DISTANCE`, `MAX_HUNGER_TO_BREED`, etc. are good; animation duration `1000` and hunger cost `0.15` could be named constants.
- **Suggestion:** Group per-system or per-feature constants at the top of the file (or in config) with names that document intent (e.g. `HUNGER_STARVING_THRESHOLD`, `HUNGER_REGEN_THRESHOLD`).

---

## 7. Dead / underused code

### utils/exceptions.js
- Custom hierarchy (`SimulationError`, `ComponentMissingError`, etc.) is never thrown in the app.
- **Suggestion:** Use these in systems/factories (e.g. when a required component is missing) and let `withErrorHandler` (or a central error handler) log them; otherwise remove or document as “for future use”.

### utils/errorHandling.js
- `withComponentValidation` and `withDebugLogging` / `withTimeout` are not used.
- **Suggestion:** Either adopt them (e.g. wrap system execute or key entity operations) or move to a “debug only” module and gate behind a flag.

### withTimeout behavior
- Implementation only measures time and logs a warning after the fact; it does not actually limit execution time.
- **Suggestion:** Rename to something like `withSlowOperationWarning` or implement a real timeout (e.g. promise + AbortController or worker) if needed.

---

## 8. Console logging in “production” paths

- **DeathSystem:** `console.log` on death and on entity removal.
- **FoodConsumptionSystem:** `console.log` on food consumed.
- **BreedingSystem:** `console.log` on breeding success and offspring creation.
- **PopulationStatsSystem:** Large `console.log` block every 10 seconds.
- **Suggestion:** Use a small logger abstraction (e.g. `logger.debug('...')`) that can be disabled or routed in production, or guard with a `debug` config flag.

---

## 9. Style / structure

### SpatialHashSystem.js
- `Position` is imported at the bottom of the file (after the class).
- **Fix:** Move the import to the top with other imports.

### config/simulation_config.js
- Inconsistent indentation around `world: { ... }` (e.g. two spaces vs four).
- **Fix:** Normalize indentation (e.g. 2 spaces) for the whole object.

### Simulation constructor
- Registers components and systems, then obtains references to specific systems (`this.babylonMeshSystem`, `this.foodSpawnerSystem`, `this.foodConsumptionSystem`).
- **Issue:** Direct dependency on concrete system classes; harder to substitute or test in isolation.
- **Suggestion:** Prefer configuration or a small “system registry” interface if you need to call into specific systems by role (e.g. “mesh system”, “food spawner”) rather than by class.

---

## 10. Primitive obsession

- Positions and deltas are plain `{ x, y, z }` objects; distance and normalization are inlined in many places.
- **Suggestion:** Optional small value types or helpers (e.g. `distanceSq(a, b)`, `normalize(vec)`, `scale(vec, s)`) in a single module to reduce duplication and make intent clearer.

---

## Summary

| Category              | Severity  | Action |
|-----------------------|-----------|--------|
| Missing Health import | Bug       | Add import in BreedingSystem.js |
| Globals (window)      | Medium    | Inject config and UI refs; avoid string component lookup |
| BabylonMeshSystem     | Medium    | Import model creators explicitly |
| Duplicated velocity   | Low       | Shared velocity clamp helper |
| Duplicated emissive   | Low       | Single helper in RenderSystem |
| HungerSystem death    | Low       | Centralize death/sinking in DeathSystem |
| Magic numbers         | Low       | Named constants per system |
| Unused utils          | Low       | Use or remove exceptions/HOFs; fix withTimeout name |
| Console.log           | Low       | Logger or debug flag |
| SpatialHash import    | Trivial   | Move import to top |

Addressing the **missing `Health` import** and **replacing implicit globals** (config, model creators, UI refs) will have the biggest immediate benefit for correctness and maintainability.
