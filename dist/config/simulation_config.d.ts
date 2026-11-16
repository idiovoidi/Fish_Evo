interface EntityConfig {
    count: number;
    spawnHeight: number;
    maxSpeed: number;
    maxForce: number;
    neighborhoodRadius: number;
    waitDurationRange?: {
        min: number;
        max: number;
    };
    updateInterval: number;
    schoolingDistance?: number;
}
interface FoodConfig {
    maxParticles: number;
    spawnInterval: number;
    daySpawnRate: number;
    nightSpawnRate: number;
    lifetime: {
        min: number;
        max: number;
    };
}
interface GraphicsConfig {
    shadows: {
        enabled: boolean;
        resolution: number;
        updateInterval: number;
    };
    postProcessing: {
        bloomEnabled: boolean;
        bloomKernel: number;
        chromaticAberration: {
            enabled: boolean;
        };
    };
    fog: {
        dayDensity: number;
        nightDensity: number;
    };
}
interface WorldBounds {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
}
interface SimulationConfigType {
    entities: {
        crabs: EntityConfig;
        fish: EntityConfig;
    };
    food: FoodConfig;
    graphics: GraphicsConfig;
    world: {
        bounds: WorldBounds;
    };
    debug: {
        showNavMesh: boolean;
        logSpawnPositions: boolean;
        showFPS: boolean;
    };
}
declare const SimulationConfig: SimulationConfigType;
export { SimulationConfig };
export type { SimulationConfigType, EntityConfig, FoodConfig, GraphicsConfig, WorldBounds };
//# sourceMappingURL=simulation_config.d.ts.map