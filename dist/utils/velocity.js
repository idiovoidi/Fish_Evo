export function clampVelocity(velocity, options = {}) {
    const { minSpeedFactor, maxSpeedMultiplier = 1 } = options;
    const maxSq = (velocity.maxSpeed * maxSpeedMultiplier) ** 2;
    const speedSq = velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z;
    if (speedSq > maxSq) {
        const s = (velocity.maxSpeed * maxSpeedMultiplier) / Math.sqrt(speedSq);
        velocity.x *= s;
        velocity.y *= s;
        velocity.z *= s;
    }
    else if (minSpeedFactor != null && minSpeedFactor > 0 && speedSq > 0) {
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
export function distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
export function distanceSq(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return dx * dx + dy * dy + dz * dz;
}
//# sourceMappingURL=velocity.js.map