interface FoodOptions {
    position?: {
        x?: number;
        y?: number;
        z?: number;
    };
    velocity?: {
        x?: number;
        y?: number;
        z?: number;
        maxSpeed?: number;
    };
    renderable?: {
        model?: any;
        scale?: number;
        visible?: boolean;
    };
}
export declare class FoodFactory {
    static create(world: any, options?: FoodOptions): any;
}
export {};
//# sourceMappingURL=FoodFactory.d.ts.map