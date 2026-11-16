# Tech Stack

## Core Technologies

- **Language**: JavaScript ES6+ (ES modules)
- **Runtime**: Web browser
- **Architecture**: Entity-Component-System (ECS) using `ecsy` library
- **Rendering**: Babylon.js 3D engine with PBR materials, post-processing, and shadows
- **UI**: Babylon.js GUI for HUD and entity inspection

## Key Libraries

- `ecsy` (v0.4.3): ECS framework accessed via `window.ECSY`
- `babylonjs`: 3D rendering, scene management, physics
- `http-server` (v14.1.1): Local development server

## Common Commands

```bash
# Start development server
npm start

# Start debug server (port 5502)
npm run debug

# Install dependencies
npm install
```

## Development

- **Debugging**: Press F5 in VS Code to launch with Chrome/Edge debugger
- **Debug Port**: 5502 (configurable in package.json)
- **Entry Point**: `index.html` loads Babylon.js, ECSY, then `core/Scene.js` and `core/start-ecs.js`

## Configuration

- Global config: `window.SimulationConfig` from `config/simulation_config.js`
- Includes entity counts, spawn rates, graphics settings, world bounds, and debug flags
