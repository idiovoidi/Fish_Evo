import { fbm, smoothstep } from './noise';

/** Half-extent of the swimmable volume (matches SimulationConfig.world.bounds). */
export const WORLD_HALF = 50;
/** Y coordinate of the water surface. */
export const WATER_LEVEL = 30;

/**
 * Analytic seabed height. The ECS systems call this directly (no raycasts)
 * so fish stay above dunes, crabs hug the floor and food settles on it.
 */
export function terrainHeight(x: number, z: number): number {
  const wx = x + (fbm(x * 0.03 + 10, z * 0.03, 2, 3) - 0.5) * 16;
  const wz = z + (fbm(x * 0.03, z * 0.03 + 20, 2, 5) - 0.5) * 16;

  const broad = fbm(wx * 0.017, wz * 0.017, 4, 1);
  const hills = Math.pow(broad, 1.7) * 9;
  const ripples = Math.sin(x * 0.55 + z * 0.22 + broad * 9) * 0.06 * (1 - broad);

  // Raise the edges into a bowl so the arena has a natural horizon.
  const r = Math.hypot(x, z);
  const rim = smoothstep(52, 100, r);

  return 0.3 + hills + ripples + rim * rim * 34;
}
