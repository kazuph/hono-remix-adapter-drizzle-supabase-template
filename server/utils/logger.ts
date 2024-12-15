import { format } from "date-fns";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  userId?: string;
  path?: string;
  method?: string;
}

export class Logger {
  private static formatLogEntry(entry: LogEntry): string {
    const { timestamp, level, message, data, userId, path, method } = entry;
    const logParts = [
      `[${timestamp}]`,
      `[${level.toUpperCase()}]`,
      userId ? `[User: ${userId}]` : "",
      method ? `[${method}]` : "",
      path ? `[${path}]` : "",
      message,
      data ? `\nData: ${JSON.stringify(data, null, 2)}` : "",
    ];

    return logParts.filter(Boolean).join(" ");
  }

  private static log(level: LogLevel, message: string, data?: any, userId?: string, path?: string, method?: string) {
    const timestamp = format(new Date(), "yyyy-MM-dd HH:mm:ss.SSS");
    const entry: LogEntry = {
      timestamp,
      level,
      message,
      data,
      userId,
      path,
      method,
    };

    const formattedLog = this.formatLogEntry(entry);

    // 本番環境では適切なログ管理サービスに送信することを推奨
    if (level === "error") {
      console.error(formattedLog);
    } else {
      console.log(formattedLog);
    }

    return entry;
  }

  static debug(message: string, data?: any, userId?: string, path?: string, method?: string) {
    return this.log("debug", message, data, userId, path, method);
  }

  static info(message: string, data?: any, userId?: string, path?: string, method?: string) {
    return this.log("info", message, data, userId, path, method);
  }

  static warn(message: string, data?: any, userId?: string, path?: string, method?: string) {
    return this.log("warn", message, data, userId, path, method);
  }

  static error(message: string, data?: any, userId?: string, path?: string, method?: string) {
    return this.log("error", message, data, userId, path, method);
  }
}
