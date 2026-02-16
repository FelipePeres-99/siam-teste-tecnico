import { Injectable } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';
import { Reader } from '@siam/types';

@Injectable()
export class DoorRepository {
  constructor(private readonly cache: CacheService) {}

  async findReadersByDoorId(doorId: string): Promise<Reader[] | null> {
    const key = `door:${doorId}:readers`;
    return this.cache.get<Reader[]>(key);
  }
}
