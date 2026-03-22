interface AnimationData {
    startTime: number;
    duration: number;
    originalScale: any;
    originalRotation: any;
    fish: any;
}
declare const BreedingSystem_base: any;
export declare class BreedingSystem extends BreedingSystem_base {
    breedingAnimations: Map<any, AnimationData>;
    init(): void;
    execute(delta: number, time: number): void;
    createOffspring(parentA: any, parentB: any): any;
    mutateValue(val: number): number;
    startBreedingAnimation(fish: any, time: number): void;
    updateBreedingAnimations(_deltaTime: number): void;
}
export {};
//# sourceMappingURL=BreedingSystem.d.ts.map