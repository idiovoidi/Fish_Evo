interface FishOptions {
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
    hunger?: {
        value?: number;
        rate?: number;
        lastFed?: number;
    };
    behavior?: {
        schoolingPreference?: number;
        personalSpace?: number;
        isHungry?: boolean;
        isFleeing?: boolean;
        isSchooling?: boolean;
        isResting?: boolean;
        isMating?: boolean;
        lastBreedTime?: number;
        breedCooldown?: number;
    };
    renderable?: {
        model?: any;
        scale?: number;
        visible?: boolean;
    };
    genetics?: {
        size?: number;
        speed?: number;
        metabolism?: number;
        color?: number[];
    };
}
export declare class FishFactory {
    static create(world: any, options?: FishOptions): any;
}
export {};
//# sourceMappingURL=FishFactory.d.ts.map