interface SharkOptions {
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
    health?: {
        current?: number;
        max?: number;
        regenRate?: number;
        isDead?: boolean;
    };
    age?: {
        value?: number;
        maturityAge?: number;
        maxAge?: number;
    };
    behavior?: {
        isHungry?: boolean;
        isFleeing?: boolean;
        isSchooling?: boolean;
        isResting?: boolean;
        isMating?: boolean;
        schoolingPreference?: number;
        personalSpace?: number;
        aggressionLevel?: number;
        huntingRadius?: number;
    };
    renderable?: {
        model?: any;
        scale?: number;
        visible?: boolean;
    };
    predatorState?: {
        lastBiteTime?: number;
        biteCooldown?: number;
        huntingTarget?: any;
        chaseSpeed?: number;
    };
    genetics?: {
        size?: number;
        speed?: number;
        metabolism?: number;
        color?: number[];
    };
}
export declare class SharkFactory {
    static create(world: any, options?: SharkOptions): any;
}
export {};
//# sourceMappingURL=SharkFactory.d.ts.map