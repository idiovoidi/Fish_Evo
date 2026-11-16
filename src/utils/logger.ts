let _debugEnabled = false;

export function setDebugLogging(enabled: boolean): void {
  _debugEnabled = Boolean(enabled);
}

export function isDebugLoggingEnabled(): boolean {
  return _debugEnabled;
}

export function debug(message: string, ...args: any[]): void {
  if (_debugEnabled) {
    console.log(message, ...args);
  }
}

export const logger = {
  debug(message: string, ...args: any[]): void {
    if (_debugEnabled) console.log(message, ...args);
  },
  warn: (...args: any[]) => console.warn(...args),
  error: (...args: any[]) => console.error(...args),
};
