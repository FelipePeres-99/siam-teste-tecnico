import { Module } from '@nestjs/common';
import { ReaderController } from './reader.controller';
import { CacheModule } from '../cache/cache.module';
import { ReaderService } from './reader.service';
import { ReaderRepository } from './reader.repository';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [CacheModule, RabbitmqModule],
  controllers: [ReaderController],
  providers: [ReaderService, ReaderRepository],
  exports: [ReaderService],
})
export class ReaderModule {}
