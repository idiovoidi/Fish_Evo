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
        maxParticles: 25,        // Reduced max for scarcity
        spawnInterval: 2000,     // Slower spawn checks
        daySpawnRate: 10,        // Reduced spawn rate during day
        nightSpawnRate: 3,       // Reduced spawn rate at night
        lifetime: {              // How long food particles last
            min: 25000,          // Slightly longer lifetime
            max: 40000           // Longer max lifetime
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