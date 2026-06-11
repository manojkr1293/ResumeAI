import fs from 'fs';
import path from 'path';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import morgan from 'morgan';
import type { Request, Response } from 'express';
import env from './env';

const logDirectory = path.resolve(process.cwd(), env.LOG_DIR);

// Ensure log directory exists
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

// Custom format combining timestamp, level, request-id (contextual), and message
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack, requestId, label }) => {
    const reqIdStr = requestId ? ` [ReqID: ${requestId as string}]` : '';
    const labelStr = label ? ` [${label as string}]` : '';
    const errorStack = stack ? `\n${stack as string}` : '';
    return `[${timestamp as string}] ${level.toUpperCase()}${labelStr}${reqIdStr}: ${message as string}${errorStack}`;
  })
);

// Colorized format for development console output
const colorizedConsoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, requestId, label }) => {
    const reqIdStr = requestId ? ` [ReqID: ${requestId as string}]` : '';
    const labelStr = label ? ` [${label as string}]` : '';
    return `[${timestamp as string}] ${level}${labelStr}${reqIdStr}: ${message as string}`;
  })
);

// Winston Transports configuration
const transports: winston.transport[] = [
  // Combined Daily Rotate File
  new DailyRotateFile({
    dirname: logDirectory,
    filename: 'combined-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: env.LOG_LEVEL,
    format: customFormat,
  }),
  // Error Daily Rotate File
  new DailyRotateFile({
    dirname: logDirectory,
    filename: 'error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
    level: 'error',
    format: customFormat,
  }),
];

// In non-production environments, log additionally to the colorized console
if (env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      level: env.LOG_LEVEL === 'debug' ? 'debug' : 'info',
      format: colorizedConsoleFormat,
    })
  );
}

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: customFormat,
  transports,
  exitOnError: false,
});

/**
 * Child Logger utility that appends modular label metadata to the logs.
 */
export const createChildLogger = (moduleLabel: string): winston.Logger => {
  return logger.child({ label: moduleLabel });
};

// Define stream for Morgan HTTP logging integration
const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Morgan format function incorporating requestId from response locals
morgan.token('requestId', (req: Request, res: Response) => {
  return (res.locals.requestId as string) || (req.headers['x-request-id'] as string) || '-';
});

morgan.token('body', (req: Request) => {
  if (env.NODE_ENV === 'development' && req.body && Object.keys(req.body as object).length > 0) {
    const bodyCopy = { ...req.body as Record<string, unknown> };
    // Redact sensitive inputs in logs
    const sensitiveKeys = ['password', 'passwordHash', 'token', 'accessToken', 'refreshToken', 'secret'];
    sensitiveKeys.forEach((key) => {
      if (key in bodyCopy) {
        bodyCopy[key] = '[REDACTED]';
      }
    });
    return `| Body: ${JSON.stringify(bodyCopy)}`;
  }
  return '';
});

export const httpLoggerMiddleware = morgan(
  ':requestId :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms :body',
  { stream: morganStream }
);

export default logger;
