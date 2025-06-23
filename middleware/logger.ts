// Logging Middleware - Extensive logging system
export interface LogEntry {
  id: string
  timestamp: string
  level: "INFO" | "WARN" | "ERROR" | "DEBUG"
  message: string
  context?: Record<string, any>
  userId?: string
  action?: string
}

class Logger {
  private logs: LogEntry[] = []
  private maxLogs = 1000

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  private createLogEntry(
    level: LogEntry["level"],
    message: string,
    context?: Record<string, any>,
    action?: string,
  ): LogEntry {
    return {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      action,
      userId: this.getCurrentUserId(),
    }
  }

  private getCurrentUserId(): string {
    // In a real app, this would get the actual user ID
    return "anonymous-user"
  }

  private persistLog(entry: LogEntry) {
    this.logs.unshift(entry)

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs)
    }

    // Persist to localStorage
    try {
      localStorage.setItem("app-logs", JSON.stringify(this.logs))
    } catch (error) {
      console.error("Failed to persist logs:", error)
    }
  }

  private loadLogs() {
    try {
      const stored = localStorage.getItem("app-logs")
      if (stored) {
        this.logs = JSON.parse(stored)
      }
    } catch (error) {
      console.error("Failed to load logs:", error)
    }
  }

  info(message: string, context?: Record<string, any>, action?: string) {
    const entry = this.createLogEntry("INFO", message, context, action)
    this.persistLog(entry)
    console.log(`[INFO] ${message}`, context)
  }

  warn(message: string, context?: Record<string, any>, action?: string) {
    const entry = this.createLogEntry("WARN", message, context, action)
    this.persistLog(entry)
    console.warn(`[WARN] ${message}`, context)
  }

  error(message: string, context?: Record<string, any>, action?: string) {
    const entry = this.createLogEntry("ERROR", message, context, action)
    this.persistLog(entry)
    console.error(`[ERROR] ${message}`, context)
  }

  debug(message: string, context?: Record<string, any>, action?: string) {
    const entry = this.createLogEntry("DEBUG", message, context, action)
    this.persistLog(entry)
    console.debug(`[DEBUG] ${message}`, context)
  }

  getLogs(): LogEntry[] {
    return [...this.logs]
  }

  clearLogs() {
    this.logs = []
    localStorage.removeItem("app-logs")
    this.info("Logs cleared by user", {}, "CLEAR_LOGS")
  }

  init() {
    this.loadLogs()
    this.info("Logger initialized", { maxLogs: this.maxLogs }, "LOGGER_INIT")
  }
}

export const logger = new Logger()

// Initialize logger
if (typeof window !== "undefined") {
  logger.init()
}
