# User Interface Specification

## 1. HUD Elements

| Element  | Location      | Description                            |
|----------|---------------|----------------------------------------|
| Stats Box | Top-left      | Shows entity counts, FPS, sim time     |
| Tooltip   | Mouse hover   | Quick info (entity type & Energy)      |
| Inspector | Right panel   | Detailed component data of selected entity |
| Controls  | Bottom-left   | Buttons: *Drop Food*, *Save*, *Load*   |

## 2. Gestures / Mouse Actions

* **Left-Click (empty space):** Drop a food pellet at cursor (spawns `Food` entity).
* **Left-Click (entity):** Select entity and open inspector.
* **Right-Click:** Deselect entity.
* **Scroll Wheel:** Zoom camera.

## 3. Inspector Panel Fields (for fish)

* Energy bar
* Age (stage)
* Genetic traits table
* Cool-downs (breeding)
* Current behavior state

## 4. UI Framework

* Native DOM + Babylon GUI (for in-canvas overlays).

## 5. Accessibility

* Color-blind friendly palette (avoid relying on hue alone).
