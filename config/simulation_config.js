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
    debug: {
        showNavMesh: false,
        logSpawnPositions: false,
        showFPS: true
    }
}; 