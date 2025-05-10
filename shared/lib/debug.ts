/**
 * Debug utility for logging in production environments
 * This helps with troubleshooting Vercel deployments
 */

// Log levels
export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

// Configuration
const config = {
  // Enable detailed logging in production
  enableProductionLogging: true,
  // Minimum log level to display
  minLevel: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
};

/**
 * Structured logger that works in both development and production
 */
export const logger = {
  error: (message: string, meta?: any) => log(LogLevel.ERROR, message, meta),
  warn: (message: string, meta?: any) => log(LogLevel.WARN, message, meta),
  info: (message: string, meta?: any) => log(LogLevel.INFO, message, meta),
  debug: (message: string, meta?: any) => log(LogLevel.DEBUG, message, meta),
};

/**
 * Internal log function
 */
function log(level: LogLevel, message: string, meta?: any) {
  // Skip logging if below minimum level
  if (!shouldLog(level)) return;

  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...(meta ? { meta } : {}),
    environment: process.env.NODE_ENV || 'development',
  };

  // Format for console
  const formattedMessage = `[${timestamp}] [${level}] ${message}`;

  // Log to appropriate console method
  switch (level) {
    case LogLevel.ERROR:
      console.error(formattedMessage, meta || '');
      break;
    case LogLevel.WARN:
      console.warn(formattedMessage, meta || '');
      break;
    case LogLevel.INFO:
      console.info(formattedMessage, meta || '');
      break;
    case LogLevel.DEBUG:
      console.debug(formattedMessage, meta || '');
      break;
  }

  // In production, you could send logs to a monitoring service here
  if (process.env.NODE_ENV === 'production' && config.enableProductionLogging) {
    // Example: send to monitoring service
    // sendToMonitoringService(logEntry);
  }
}

/**
 * Determine if a log message should be displayed based on level
 */
function shouldLog(level: LogLevel): boolean {
  const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
  const minLevelIndex = levels.indexOf(config.minLevel);
  const currentLevelIndex = levels.indexOf(level);
  
  return currentLevelIndex <= minLevelIndex;
}

/**
 * Helper to log API request details
 */
export function logApiRequest(method: string, url: string, body?: any) {
  logger.info(`API Request: ${method} ${url}`, { body });
}

/**
 * Helper to log API response details
 */
export function logApiResponse(status: number, body?: any) {
  logger.info(`API Response: ${status}`, { body });
}
