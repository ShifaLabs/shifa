/**
 * Simple logger utility
 * In production, replace with Winston, Pino, or similar
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";

  private formatMessage(
    level: LogLevel,
    message: string,
    data?: any,
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(data && { data }),
    };
  }

  private write(entry: LogEntry) {
    if (this.isDevelopment) {
      // In development, use console with colors
      const colorMap: Record<LogLevel, string> = {
        debug: "\x1b[36m", // Cyan
        info: "\x1b[32m", // Green
        warn: "\x1b[33m", // Yellow
        error: "\x1b[31m", // Red
      };

      const reset = "\x1b[0m";
      const color = colorMap[entry.level];

      console.log(
        `${color}[${entry.level.toUpperCase()}]${reset} ${entry.timestamp} - ${entry.message}`,
        entry.data || "",
      );
    } else {
      // In production, output JSON for log aggregation tools
      console.log(JSON.stringify(entry));
    }
  }

  debug(message: string, data?: any) {
    if (this.isDevelopment) {
      this.write(this.formatMessage("debug", message, data));
    }
  }

  info(message: string, data?: any) {
    this.write(this.formatMessage("info", message, data));
  }

  warn(message: string, data?: any) {
    this.write(this.formatMessage("warn", message, data));
  }

  error(message: string, error?: any) {
    const errorData =
      error instanceof Error
        ? {
            message: error.message,
            stack: error.stack,
            ...(error as any),
          }
        : error;

    this.write(this.formatMessage("error", message, errorData));
  }
}

export const logger = new Logger();
