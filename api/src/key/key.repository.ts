import { Injectable } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';
import { Key, Reader} from '@siam/types';

@Injectable()
export class KeyRepository {
  constructor(private readonly cache: CacheService) {}

  async findById(keyId: string): Promise<Key | null> {
    const key = `key:${keyId}`;
    return this.cache.get<Key>(key);
  }
  async findAuthorizedReadersByKeyId(keyId: string): Promise<Number[] | null> {
    const key = `key:${keyId}:authorized_readers`;
    return this.cache.smembers<Number>(key);
  }

}
