/** Live population numbers, written by PopulationStatsSystem and read by the UI. */
export interface PopulationStats {
  fish: number;
  adults: number;
  juveniles: number;
  sharks: number;
  crabs: number;
  food: number;
  births: number;
  deaths: { starvation: number; age: number; predator: number };
  avgHunger: number;
  avgHealth: number;
  avgSize: number;
  avgSpeed: number;
  avgMetabolism: number;
  avgColor: [number, number, number];
  oldestAge: number;
  /** Highest number of generations seen (0 = original stock). */
  maxGeneration: number;
  history: { time: number[]; fish: number[]; speed: number[]; size: number[] };
}

export const HISTORY_LENGTH = 180;

export function createStats(): PopulationStats {
  return {
    fish: 0, adults: 0, juveniles: 0, sharks: 0, crabs: 0, food: 0,
    births: 0,
    deaths: { starvation: 0, age: 0, predator: 0 },
    avgHunger: 0, avgHealth: 0, avgSize: 0, avgSpeed: 0, avgMetabolism: 0,
    avgColor: [120, 180, 220],
    oldestAge: 0,
    maxGeneration: 0,
    history: { time: [], fish: [], speed: [], size: [] }
  };
}

export const stats: PopulationStats = createStats();

export function resetStats() {
  Object.assign(stats, createStats());
}
