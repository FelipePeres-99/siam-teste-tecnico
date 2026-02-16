import { Module } from '@nestjs/common';
import { CacheModule } from '../cache/cache.module';
import { KeyService } from './key.service';
import { KeyRepository } from './key.repository';

@Module({
  imports: [CacheModule],
  controllers: [],
  providers: [KeyService, KeyRepository],
  exports: [KeyService],
})
export class KeyModule {}