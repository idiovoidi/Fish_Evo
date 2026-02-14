/**
 * Error handling utilities for the simulation.
 * Uses Higher-Order Functions to wrap critical functions with error checking.
 * withErrorHandler is used by Simulation; withComponentValidation and withDebugLogging
 * are optional and can be applied to system/entity logic where needed.
 */

/**
 * Wraps a function with basic try/catch error handling
 * @param {Function} fn - The function to wrap
 * @param {string} operationName - Name of the operation for logging
 * @param {Function} [onError] - Optional error handler
 * @returns {Function} Wrapped function with error handling
 */
export function withErrorHandler(fn, operationName, onError) {
  return function(...args) {
    try {
      return fn.apply(this, args);
    } catch (err) {
      console.error(`Error in ${operationName}:`, err);
      if (typeof onError === 'function') {
        return onError(err, ...args);
      }
      // Return a default value or rethrow based on context
      return null;
    }
  };
}

/**
 * Validates component access to avoid null reference errors
 * @param {Function} fn - Function that accesses components
 * @returns {Function} Wrapped function with component validation
 */
export function withComponentValidation(fn) {
  return function(entity, ...args) {
    if (!entity || typeof entity.getComponent !== 'function') {
      console.warn('Invalid entity passed to component operation');
      return null;
    }
    return fn.call(this, entity, ...args);
  };
}

/**
 * Adds debug logging to a function
 * @param {Function} fn - The function to add logging to
 * @param {string} fnName - Name of the function for logging
 * @returns {Function} Wrapped function with debug logging
 */
export function withDebugLogging(fn, fnName) {
  return function(...args) {
    const startTime = performance.now();
    const result = fn.apply(this, args);
    const endTime = performance.now();
    
    console.debug(`[DEBUG] ${fnName} executed in ${(endTime - startTime).toFixed(2)}ms`);
    return result;
  };
}

/**
 * Logs a warning if the function runs longer than the given threshold.
 * Does not actually interrupt execution (no real timeout).
 * @param {Function} fn - The function to wrap
 * @param {number} warnThresholdMs - Log warning if execution exceeds this (ms)
 * @returns {Function} Wrapped function
 */
export function withSlowOperationWarning(fn, warnThresholdMs = 100) {
  return function(...args) {
    const startTime = performance.now();
    const result = fn.apply(this, args);
    const elapsed = performance.now() - startTime;
    if (elapsed > warnThresholdMs) {
      console.warn(`[Slow] Execution took ${elapsed.toFixed(2)}ms (threshold: ${warnThresholdMs}ms)`);
    }
    return result;
  };
} 