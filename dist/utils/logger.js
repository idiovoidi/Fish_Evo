let _debugEnabled = false;
export function setDebugLogging(enabled) {
    _debugEnabled = Boolean(enabled);
}
export function isDebugLoggingEnabled() {
    return _debugEnabled;
}
export function debug(message, ...args) {
    if (_debugEnabled) {
        console.log(message, ...args);
    }
}
export const logger = {
    debug(message, ...args) {
        if (_debugEnabled)
            console.log(message, ...args);
    },
    warn: (...args) => console.warn(...args),
    error: (...args) => console.error(...args),
};
//# sourceMappingURL=logger.js.map