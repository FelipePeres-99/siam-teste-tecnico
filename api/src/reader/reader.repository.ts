import { Injectable } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';
import { Reader } from '@siam/types';

@Injectable()
export class ReaderRepository {
  constructor(private readonly cache: CacheService) {}

  async findById(readerId: string): Promise<Reader | null> {
    const key = `reader:${readerId}`;
    return this.cache.get<Reader>(key);
  }
}
