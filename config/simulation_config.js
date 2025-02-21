// Simulation configuration settings
const SimulationConfig = {
    entities: {
        crabs: {
            count: 10,
            spawnHeight: 0.1,
            maxSpeed: 2,
            maxForce: 0.5,
            neighborhoodRadius: 5,
            waitDurationRange: { min: 3, max: 5 }
        },
        fish: {
            count: 50,
            spawnHeight: 5,
            maxSpeed: 8,
            maxForce: 1,
            neighborhoodRadius: 5,
            schoolingDistance: 2
        }
    },
    debug: {
        showNavMesh: true,
        logSpawnPositions: true
    }
}; 