export declare function setDebugLogging(enabled: boolean): void;
export declare function isDebugLoggingEnabled(): boolean;
export declare function debug(message: string, ...args: any[]): void;
export declare const logger: {
    debug(message: string, ...args: any[]): void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
};
//# sourceMappingURL=logger.d.ts.map