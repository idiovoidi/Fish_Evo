interface EntityConfig {
  count: number;
  spawnHeight: number;
  maxSpeed: number;
  maxForce: number;
  neighborhoodRadius: number;
  waitDurationRange?: { min: number; max: number };
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

const SimulationConfig: SimulationConfigType = {
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
    maxParticles: 25,
    spawnInterval: 2000,
    daySpawnRate: 10,
    nightSpawnRate: 3,
    lifetime: {
      min: 25000,
      max: 40000
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

if (typeof window !== 'undefined') {
  (window as any).SimulationConfig = (window as any).SimulationConfig || SimulationConfig;
}

export { SimulationConfig };
export type { SimulationConfigType, EntityConfig, FoodConfig, GraphicsConfig, WorldBounds };
