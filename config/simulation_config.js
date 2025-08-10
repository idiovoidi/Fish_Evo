// Simulation configuration settings
const SimulationConfig = {
    entities: {
        crabs: {
            count: 8,
            spawnHeight: 0.1,
            maxSpeed: 2,
            maxForce: 0.5,
            neighborhoodRadius: 5,
            waitDurationRange: { min: 3, max: 5 },
            updateInterval: 2
        },
        fish: {
            count: 30,
            spawnHeight: 5,
            maxSpeed: 8,
            maxForce: 1,
            neighborhoodRadius: 5,
            schoolingDistance: 2,
            updateInterval: 2
        }
    },
    food: {
        maxParticles: 50,        // Maximum number of food particles in the scene
        spawnInterval: 1000,     // Spawn check interval in milliseconds
        daySpawnRate: 15,        // Particles per minute during day
        nightSpawnRate: 5,       // Particles per minute during night
        lifetime: {              // How long food particles last
            min: 20000,          // Minimum lifetime in milliseconds
            max: 30000           // Maximum lifetime in milliseconds
        }
    },
    graphics: {
        shadows: {
            enabled: true,
            resolution: 1024,
            updateInterval: 5
        },
        postProcessing: {
            bloomEnabled: true,
            bloomKernel: 32,
            chromaticAberration: {
                enabled: false
            }
        },
        fog: {
            dayDensity: 0.02,
            nightDensity: 0.03
        }
    },
  world: {
    bounds: {
      minX: -50, maxX: 50,
      minY: 0, maxY: 30,
      minZ: -50, maxZ: 50
    }
  },
    debug: {
        showNavMesh: false,
        logSpawnPositions: false,
        showFPS: true
    }
};

// Expose to global scope for modules that access via window.SimulationConfig
if (typeof window !== 'undefined') {
  window.SimulationConfig = window.SimulationConfig || SimulationConfig;
}