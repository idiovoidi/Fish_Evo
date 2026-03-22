interface AnimationData {
    startTime: number;
    duration: number;
    originalScale: any;
    fish: any;
}
declare const FoodConsumptionSystem_base: any;
export declare class FoodConsumptionSystem extends FoodConsumptionSystem_base {
    spatial: any;
    eatingAnimations: Map<any, AnimationData>;
    init(): void;
    execute(delta: number, time: number): void;
    pursueFood(fish: any, fishPos: any, foodPos: any, fishVel: any, deltaTime: number, hungerLevel: number): void;
    consumeFood(fish: any, food: any, time: number): void;
    startEatingAnimation(fish: any, time: number): void;
    updateEatingAnimations(_deltaTime: number): void;
}
export {};
//# sourceMappingURL=FoodConsumptionSystem.d.ts.map