interface AnimationData {
    startTime: number;
    duration: number;
    originalAlpha: number;
    originalScale: any;
    entity: any;
}
declare const DeathSystem_base: any;
export declare class DeathSystem extends DeathSystem_base {
    deathAnimations: Map<any, AnimationData>;
    DEATH_ANIMATION_DURATION: number;
    init(): void;
    execute(_delta: number, time: number): void;
    startDeathAnimation(entity: any, time: number): void;
    updateDeathAnimations(currentTime: number): void;
}
export {};
//# sourceMappingURL=DeathSystem.d.ts.map