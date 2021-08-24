export interface ILogger {
  log(message?: string | undefined): void;
  fail(err: number, message: string): void;
}
