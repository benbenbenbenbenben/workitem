export interface ILogger {
    log(message: string): void
    fail(err: number, message: string): void
}