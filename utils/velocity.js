/**
 * Shared velocity helpers for ECS systems.
 * Clamp or scale velocity to stay within min/max speed.
 */

/**
 * Clamp velocity to max speed and optionally enforce a minimum speed.
 * Mutates velocity in place.
 * @param {{ x: number, y: number, z: number, maxSpeed: number }} velocity - Mutable velocity component
 * @param {{ minSpeedFactor?: number, maxSpeedMultiplier?: number }} options
 *   - minSpeedFactor: fraction of maxSpeed to enforce as minimum (e.g. 0.3); omit to skip min clamp
 *   - maxSpeedMultiplier: scale for max speed (e.g. 1.2); default 1
 */
export function clampVelocity(velocity, options = {}) {
  const { minSpeedFactor, maxSpeedMultiplier = 1 } = options;
  const maxSq = (velocity.maxSpeed * maxSpeedMultiplier) ** 2;
  const speedSq = velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z;

  if (speedSq > maxSq) {
    const s = (velocity.maxSpeed * maxSpeedMultiplier) / Math.sqrt(speedSq);
    velocity.x *= s;
    velocity.y *= s;
    velocity.z *= s;
  } else if (minSpeedFactor != null && minSpeedFactor > 0 && speedSq > 0) {
    const minSpeed = velocity.maxSpeed * minSpeedFactor;
    const minSq = minSpeed * minSpeed;
    if (speedSq < minSq) {
      const s = minSpeed / Math.sqrt(speedSq);
      velocity.x *= s;
      velocity.y *= s;
      velocity.z *= s;
    }
  }
}

/**
 * Distance between two position-like objects { x, y, z }.
 * @param {{ x: number, y: number, z: number }} a
 * @param {{ x: number, y: number, z: number }} b
 * @returns {number}
 */
export function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Squared distance (avoids sqrt when comparing to radius²).
 * @param {{ x: number, y: number, z: number }} a
 * @param {{ x: number, y: number, z: number }} b
 * @returns {number}
 */
export function distanceSq(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}
