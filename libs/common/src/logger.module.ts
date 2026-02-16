import { Module, Global } from '@nestjs/common';
import { LoggerServiceImpl } from './logger.service';
import { LoggerService } from '@siam/types';

@Global()
@Module({
  providers: [
    {
      provide: LoggerService,
      useClass: LoggerServiceImpl,
    },
  ],
  exports: [LoggerService],
})
export class LoggerModule {}
