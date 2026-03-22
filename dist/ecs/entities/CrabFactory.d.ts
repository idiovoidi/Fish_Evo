interface CrabOptions {
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
        isAdult?: boolean;
    };
    behavior?: {
        schoolingPreference?: number;
        personalSpace?: number;
        isHungry?: boolean;
        isFleeing?: boolean;
        isSchooling?: boolean;
        isResting?: boolean;
        isMating?: boolean;
        waitTime?: number;
        waitDuration?: number;
        lastStateChange?: number;
    };
    renderable?: {
        model?: any;
        scale?: number;
        visible?: boolean;
    };
}
export declare class CrabFactory {
    static create(world: any, options?: CrabOptions): any;
}
export {};
//# sourceMappingURL=CrabFactory.d.ts.map