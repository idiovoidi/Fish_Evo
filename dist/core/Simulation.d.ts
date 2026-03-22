import { UIManager } from './UIManager';
export declare class Simulation {
    world: any;
    running: boolean;
    lastTime: number;
    scene: any;
    babylonMeshSystem: any;
    foodSpawnerSystem: any;
    foodConsumptionSystem: any;
    uiManager: UIManager | null;
    constructor();
    private _update;
    private _initialize;
    update(delta: number, time: number): void;
    initialize(scene: any): void;
    registerComponents(): void;
    registerSystems(): void;
    createInitialEntities(): void;
    start(): void;
    stop(): void;
    loop(): void;
    cleanup(): void;
}
//# sourceMappingURL=Simulation.d.ts.map