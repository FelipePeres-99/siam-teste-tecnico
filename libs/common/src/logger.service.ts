import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import { LoggerService } from '../../types/src';
import { ERROR_LOG_FILE_TOKEN, LOG_FILE_TOKEN, LOG_LEVEL_TOKEN } from './constants/tokens.constants';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LoggerServiceImpl implements LoggerService {
  private logger: winston.Logger;
  private loggerName: string = 'app';

  constructor(private readonly configService: ConfigService) {
    this.initializeLogger();
  }

  private initializeLogger(): void {
    // Determine log file names based on environment or context
    const logFile = this.configService.get<string>(LOG_FILE_TOKEN, `logs/${this.loggerName}.log`);
    const errorLogFile = this.configService.get<string>(ERROR_LOG_FILE_TOKEN, 'logs/error.log');

    this.logger = winston.createLogger({
      level: this.configService.get<string>(LOG_LEVEL_TOKEN, 'info'),
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.printf(({ timestamp, level, message, context, meta, stack }) => {
          const contextStr = context ? ` [${context}]` : '';
          const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
          const stackStr = stack ? `\n${stack}` : '';
          return `${timestamp} [${level.toUpperCase()}]${contextStr}: ${message}${metaStr}${stackStr}`;
        }),
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: logFile }),
        new winston.transports.File({ filename: errorLogFile, level: 'error' }),
      ],
    });
  }

  setLoggerName(name: string): void {
    this.loggerName = name;
    this.initializeLogger();
  }

  debug(message: string, context?: string, meta?: any): void {
    this.logger.debug(message, { context, meta });
  }

  log(message: string, context?: string, meta?: any): void {
    this.logger.info(message, { context, meta });
  }

  warn(message: string, context?: string, meta?: any): void {
    this.logger.warn(message, { context, meta });
  }

  error(message: string, trace?: string, context?: string, meta?: any): void {
    this.logger.error(message, { context, meta, stack: trace });
  }
}
