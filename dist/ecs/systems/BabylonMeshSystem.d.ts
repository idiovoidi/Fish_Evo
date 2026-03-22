declare const BabylonMeshSystem_base: any;
export declare class BabylonMeshSystem extends BabylonMeshSystem_base {
    scene: any;
    fishModels: any[];
    fishTemplate: any;
    fishPrimitiveTemplate: any;
    foodModels: any[];
    materialCache: Map<string, any>;
    sharkTemplate: any;
    crabTemplate: any;
    init(): void;
    setScene(scene: any): void;
    createModelTemplates(): void;
    execute(): void;
    createSimpleMesh(entity: any, template: any, prefix: string): void;
    createFishMesh(entity: any): void;
    applyColorToNode(node: any, rgbArray: number[]): void;
}
export {};
//# sourceMappingURL=BabylonMeshSystem.d.ts.map