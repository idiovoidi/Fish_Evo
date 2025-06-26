# Save-State System Plan

The save-state feature enables pausing the simulation and resuming later or sharing interesting worlds.

## 1. Serialization Format

* **Format:** JSON (human-readable, easy to debug).
* **Top-Level Keys:**
  * `world`: array of entities.
  * `time`: simulation timestamp (ms).
  * `version`: schema version.

### 1.1 Entity Record
```
{
  "id": 123,
  "components": {
    "Position": {"x": 1, "y": 5, "z": -2},
    "Velocity": {"x": 0, "y": 0, "z": 0, "maxSpeed": 6},
    "Renderable": {"scale": 1.2, "color": [102,180,255]},
    "Energy": 87,
    "Genetics": {"size":1.2,"speed":7,"metabolism":1.1,"color":[102,180,255]},
    "FishTag": {}
  }
}
```
Only components flagged `serializable = true` will be written.

## 2. Implementation Steps

1. **`Serializable` Marker Component** – attach to entities that must persist.
2. **`SaveSystem`**
   * Walks entities, builds JSON, triggers download (`save-YYYYMMDD.json`).
3. **`LoadSystem`**
   * Parses JSON, recreates entities via factories, restores world time.
4. **UI Hooks**
   * "Save" & "Load" buttons in the inspector panel.

## 3. Backwards Compatibility

Include `version` in file; loaders migrate old versions forward via transformation functions.

## 4. File Size Estimates

At 300 entities ≈ 50 KB per save. 