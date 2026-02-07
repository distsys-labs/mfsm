declare module 'logging' {
  export interface Logger {
    debug(message: string): void
    info(message: string): void
    warn(message: string): void
    error(message: string): void
  }

  export interface LoggerOptions {
    debugFunction?: (message: string) => void
    logFunction?: (message: string) => void
  }

  export default function createLogger(
    title: string,
    options?: LoggerOptions
  ): Logger
}
