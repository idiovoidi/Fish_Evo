export interface WorldBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

export interface SimulationConfigType {
  entities: {
    fish: { schools: number; perSchool: number };
    sharks: { count: number };
    crabs: { count: number; maxSpeed: number; spawnHeight: number };
  };
  food: {
    maxPellets: number;
    /** Milliseconds between spawn attempts at midday. */
    spawnInterval: number;
    /** Seconds a pellet lingers on the seabed before dissolving. */
    lifetime: number;
  };
  world: {
    bounds: WorldBounds;
  };
  /** Longest slice (ms) fed to the ECS in one step; larger frames are sub-stepped. */
  maxStepMs: number;
  debug: {
    logging: boolean;
  };
}

export const SimulationConfig: SimulationConfigType = {
  entities: {
    fish: { schools: 6, perSchool: 6 },
    sharks: { count: 1 },
    crabs: { count: 10, maxSpeed: 2, spawnHeight: 0.15 }
  },
  food: {
    maxPellets: 30,
    spawnInterval: 1400,
    lifetime: 45
  },
  world: {
    bounds: {
      minX: -50, maxX: 50,
      minY: 0, maxY: 30,
      minZ: -50, maxZ: 50
    }
  },
  maxStepMs: 50,
  debug: {
    logging: false
  }
};

// Exposed for tweaking from the browser console.
if (typeof window !== 'undefined') {
  (window as any).SimulationConfig = SimulationConfig;
}
