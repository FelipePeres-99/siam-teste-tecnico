import { Module } from '@nestjs/common';
import { CacheModule } from '../cache/cache.module';
import { DoorService } from './door.service';
import { DoorRepository } from './door.repository';

@Module({
  imports: [CacheModule],
  controllers: [],
  providers: [DoorService, DoorRepository],
  exports: [DoorService],
})
export class DoorModule {}