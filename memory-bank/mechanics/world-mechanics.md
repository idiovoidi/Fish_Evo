# World Mechanics

Defines global environmental parameters for the simulation.

## 1. Tank Dimensions

* **Width:** 100 units
* **Height:** 40 units (water column)
* **Depth:** 100 units

Entities are constrained inside this bounding box. Boundary collisions are handled with simple reflection for now.

## 2. Day / Night Cycle (Optional Future)

| Parameter          | Value | Notes                           |
|--------------------|-------|---------------------------------|
| Full Cycle Length  | 300 s | Real-time seconds for one cycle |
| Light Intensity Range | 0.4 – 1.0 | Affects visual brightness     |

## 3. Water Physics

* **Buoyancy:** Ignored (neutral) at present.
* **Currents:** Not simulated yet but placeholder vector field hook exists in `ecs/systems/MovementSystem`.

## 4. Food Spawn Region

Food is generated within X/Z ±80 range and Y = 30 (top). Downward velocity 1–3 units/s.

## 5. Performance Budget

Target ≤ 300 entities at 60 FPS on a mid-range desktop (i5 + integrated GPU).
