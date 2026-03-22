interface Bounds {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
}
declare const MovementSystem_base: any;
export declare class MovementSystem extends MovementSystem_base {
    bounds: Bounds;
    init(): void;
    execute(delta: number, _time: number): void;
    applyBoundaryConstraints(position: any, velocity: any): void;
    clampVelocity(velocity: any): void;
}
export {};
//# sourceMappingURL=MovementSystem.d.ts.map