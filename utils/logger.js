/**
 * Simple logger that respects debug config.
 * Use instead of console.log in systems so logs can be disabled in production.
 */

let _debugEnabled = false;

/**
 * Enable or disable debug logging (e.g. from SimulationConfig.debug).
 * @param {boolean} enabled
 */
export function setDebugLogging(enabled) {
  _debugEnabled = Boolean(enabled);
}

/**
 * @returns {boolean}
 */
export function isDebugLoggingEnabled() {
  return _debugEnabled;
}

/**
 * Log only when debug is enabled.
 * @param {string} message
 * @param {...*} args
 */
export function debug(message, ...args) {
  if (_debugEnabled) {
    console.log(message, ...args);
  }
}

/**
 * Logger object for use in systems (avoids importing and checking config everywhere).
 */
export const logger = {
  debug(message, ...args) {
    if (_debugEnabled) console.log(message, ...args);
  },
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args),
};
