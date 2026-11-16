declare const FoodSpawnerSystem_base: any;
export declare class FoodSpawnerSystem extends FoodSpawnerSystem_base {
    lastSpawnTime: number;
    spawnInterval: number;
    spawnMinCount: number;
    spawnMaxCount: number;
    maxFoodCount: number;
    init(): void;
    updateConfig(params?: any): void;
    execute(_delta: number, time: number): void;
    spawnFood(): void;
}
export {};
//# sourceMappingURL=FoodSpawnerSystem.d.ts.map