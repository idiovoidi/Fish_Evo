declare const RenderSystem_base: any;
export declare class RenderSystem extends RenderSystem_base {
    execute(_delta: number, _time: number): void;
    updateEntityOrientation(entity: any, renderable: any): void;
    setEmissiveOnRenderable(renderable: any, r: number, g: number, b: number): void;
    updateFishVisualState(entity: any, renderable: any): void;
}
export {};
//# sourceMappingURL=RenderSystem.d.ts.map