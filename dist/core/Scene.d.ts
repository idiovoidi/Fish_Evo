export declare class Scene {
    canvas: HTMLCanvasElement;
    engine: any;
    scene: any;
    camera: any;
    landscape: any;
    entityHandler: any;
    dayNightCycle: any;
    coralManager: any;
    debrisManager: any;
    sharkHandler: any;
    foodSpawner: any;
    seaweedManager: any;
    frameCount: number;
    fpsDisplay: any;
    constructor(canvas: HTMLCanvasElement);
    initialize(): Promise<void>;
    startRenderLoop(): void;
    getScene(): any;
    getEngine(): any;
    getCamera(): any;
    getLandscape(): any;
    getDayNightCycle(): any;
}
//# sourceMappingURL=Scene.d.ts.map