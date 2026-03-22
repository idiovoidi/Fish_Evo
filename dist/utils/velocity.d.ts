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
export declare function clampVelocity(velocity: Velocity, options?: ClampOptions): void;
interface Position {
    x: number;
    y: number;
    z: number;
}
export declare function distance(a: Position, b: Position): number;
export declare function distanceSq(a: Position, b: Position): number;
export {};
//# sourceMappingURL=velocity.d.ts.map