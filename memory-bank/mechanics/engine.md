# Engine Architecture Notes

## 1. Technology Stack

* **Rendering:** Babylon.js (WebGL)
* **ECS Framework:** ecsy
* **Physics:** Custom lightweight (bounding-box checks) – no full physics engine.

## 2. Execution Order per Frame

1. FoodSpawnerSystem
2. PredatorLogicSystem *(future)*
3. HungerSystem
4. BreedingSystem *(future)*
5. MovementSystem
6. CollisionSystem *(future)*
7. BabylonMeshSystem (create/dispose meshes)
8. RenderSystem (sync mesh transforms)

## 3. Component Guidelines

* Keep components flat & data-only.
* Flag serializable components with `static serializable = true`.

## 4. Performance Tips

* Prefer typed arrays in hot loops.
* Batch mesh clones where possible.
