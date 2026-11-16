declare const SpatialHashSystem_base: any;
export declare class SpatialHashSystem extends SpatialHashSystem_base {
    grid: Map<string, any[]>;
    init(): void;
    execute(): void;
    getEntitiesNear(pos: any, radius: number, componentClass?: any): any[];
}
export {};
//# sourceMappingURL=SpatialHashSystem.d.ts.map