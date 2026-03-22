declare const PopulationStatsSystem_base: any;
export declare class PopulationStatsSystem extends PopulationStatsSystem_base {
    lastLogTime: number;
    logInterval: number;
    birthCount: number;
    deathCount: number;
    startTime: number;
    init(): void;
    execute(_delta: number, time: number): void;
}
export {};
//# sourceMappingURL=PopulationStatsSystem.d.ts.map