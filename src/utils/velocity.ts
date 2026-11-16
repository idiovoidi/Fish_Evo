interface Velocity {
  x: number;
  y: number;
  z: number;
  maxSpeed: number;
}

interface ClampOptions {
  minSpeedFactor?: number;
  maxSpeedMultiplier?: number;
}

export function clampVelocity(velocity: Velocity, options: ClampOptions = {}): void {
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

interface Position {
  x: number;
  y: number;
  z: number;
}

export function distance(a: Position, b: Position): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function distanceSq(a: Position, b: Position): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}
