export function withErrorHandler(fn, operationName, onError) {
    return function (...args) {
        try {
            return fn.apply(this, args);
        }
        catch (err) {
            console.error(`Error in ${operationName}:`, err);
            if (typeof onError === 'function') {
                return onError(err, ...args);
            }
            return null;
        }
    };
}
export function withComponentValidation(fn) {
    return function (entity, ...args) {
        if (!entity || typeof entity.getComponent !== 'function') {
            console.warn('Invalid entity passed to component operation');
            return null;
        }
        return fn.call(this, entity, ...args);
    };
}
export function withDebugLogging(fn, fnName) {
    return function (...args) {
        const startTime = performance.now();
        const result = fn.apply(this, args);
        const endTime = performance.now();
        console.debug(`[DEBUG] ${fnName} executed in ${(endTime - startTime).toFixed(2)}ms`);
        return result;
    };
}
export function withSlowOperationWarning(fn, warnThresholdMs = 100) {
    return function (...args) {
        const startTime = performance.now();
        const result = fn.apply(this, args);
        const elapsed = performance.now() - startTime;
        if (elapsed > warnThresholdMs) {
            console.warn(`[Slow] Execution took ${elapsed.toFixed(2)}ms (threshold: ${warnThresholdMs}ms)`);
        }
        return result;
    };
}
//# sourceMappingURL=errorHandling.js.map