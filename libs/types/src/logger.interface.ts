export abstract class LoggerService {
  abstract debug(message: string, context?: string, meta?: any): void;
  abstract log(message: string, context?: string, meta?: any): void;
  abstract warn(message: string, context?: string, meta?: any): void;
  abstract error(message: string, trace?: string, context?: string, meta?: any): void;
}
