import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { CacheService } from './cache.service';
import { REDIS_CLIENT_TOKEN } from '@siam/common';

@Injectable()
export class RedisCacheService implements CacheService {
  constructor(@Inject(REDIS_CLIENT_TOKEN) private readonly redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    if (value) {
      try {
        return JSON.parse(value) as T;
      } catch {
        // If parsing fails, return the value as-is (e.g., plain string tokens)
        return value as unknown as T;
      }
    }
    return null;
  }

  async smembers<T>(key: string): Promise<T[] | null> {
    const values = await this.redis.smembers(key);
    if (values && values.length > 0) {
      return values as T[];
    }
    return null;
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const crypto = require('crypto');
    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    const blacklistEntry = await this.redis.get(`blacklist:${tokenHash}`);
    return blacklistEntry !== null;
  }
}
