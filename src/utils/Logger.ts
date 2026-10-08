type LogLevel = "debug" | "info" | "warn" | "error";

const priorities: Readonly<Record<LogLevel, number>> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export class Logger {
  private static readonly minimumLevel: LogLevel =
    process.env.LOG_LEVEL === "debug" ||
    process.env.LOG_LEVEL === "warn" ||
    process.env.LOG_LEVEL === "error"
      ? process.env.LOG_LEVEL
      : "info";

  private static log(level: LogLevel, message: string): void {
    if (priorities[level] < priorities[Logger.minimumLevel]) return;
    const line = `${new Date().toISOString()} [${level.toUpperCase()}] ${message}`;
    if (level === "error") console.error(line);
    else if (level === "warn") console.warn(line);
    else console.log(line);
  }

  static debug(message: string): void {
    Logger.log("debug", message);
  }

  static info(message: string): void {
    Logger.log("info", message);
  }

  static warn(message: string): void {
    Logger.log("warn", message);
  }

  static error(message: string): void {
    Logger.log("error", message);
  }
}
