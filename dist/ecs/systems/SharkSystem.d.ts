declare const SharkSystem_base: any;
export declare class SharkSystem extends SharkSystem_base {
    spatial: any;
    init(): void;
    execute(delta: number, time: number): void;
    patrolBehavior(shark: any, velocity: any, deltaTime: number, baseSpeed: number): void;
    stalkBehavior(shark: any, targetPos: any, velocity: any, speed: number, deltaTime: number): void;
    chaseBehavior(shark: any, targetPos: any, velocity: any, chaseSpeed: number, deltaTime: number): void;
    attackBehavior(shark: any, targetFish: any, predState: any, time: number): void;
    selectBestTarget(shark: any, fishList: any[], sharkPos: any): any;
    getDistance(pos1: any, pos2: any): number;
    clampVelocity(velocity: any): void;
}
export {};
//# sourceMappingURL=SharkSystem.d.ts.map