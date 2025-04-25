/**
 * Error handling utilities for the simulation
 * Uses Higher-Order Functions to wrap critical functions with error checking
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
 * Ensures the function never takes longer than a timeout
 * @param {Function} fn - The function to apply timeout to
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Function} Wrapped function with timeout
 */
export function withTimeout(fn, timeoutMs = 100) {
  return function(...args) {
    const startTime = performance.now();
    const result = fn.apply(this, args);
    const elapsedTime = performance.now() - startTime;
    
    if (elapsedTime > timeoutMs) {
      console.warn(`Function execution took ${elapsedTime.toFixed(2)}ms, which exceeds the timeout of ${timeoutMs}ms`);
    }
    
    return result;
  };
} 