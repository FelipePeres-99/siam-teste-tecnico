import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { Key, KeyAuthorization, LoggerService, User } from '@siam/types';
import { CacheService } from './cache.service';
import { KEY_AUTHORIZATION_CREATED_EVENT, KEY_CREATED_EVENT, USER_CREATED_EVENT, USERS_DELETED_EVENT } from 'src/constants/events.constants';

@Controller()
export class CacheEventsSubscriber {
  constructor(
    private readonly cacheService: CacheService,
    private readonly logger: LoggerService,
  ) {}

  @EventPattern(USER_CREATED_EVENT)
  async handleUserCreated(@Payload() user: User) {
    await this.cacheService.set(`user:${user.userId}`, JSON.stringify(user));
    this.logger.log(
      `Middleware: Cached user ${user.userId} in Redis via RabbitMQ event`,
      'CacheEventsSubscriber',
    );
  }

  @EventPattern(USERS_DELETED_EVENT)
  async handleUsersDeleted(@Payload() keys: string[]) {
    if (keys.length > 0) {
      await this.cacheService.del(...keys);
    }
    this.logger.log(
      `Middleware: Invalidated user caches in Redis for keys: ${keys.join(', ')}`,
      'CacheEventsSubscriber',
    );
  }

  @EventPattern(KEY_CREATED_EVENT)
  async handleKeyCreated(@Payload() key: Key) {
    await this.cacheService.set(`user:${key.userId}:keys`, JSON.stringify(key));
    this.logger.log(
      `Middleware: Cached key ${key.keyId} in Redis via RabbitMQ event`,
      'CacheEventsSubscriber',
    );
  }

  @EventPattern(KEY_AUTHORIZATION_CREATED_EVENT)
  async handleKeyAuthorizationCreated(@Payload() keyAuthorization: KeyAuthorization) {
    await this.cacheService.set(
      `key:${keyAuthorization.keyId}`,
      JSON.stringify(keyAuthorization),
    );
    // Add reader to the set of authorized readers for this key
    await this.cacheService.sadd(
      `key:${keyAuthorization.keyId}:authorized_readers`,
      keyAuthorization.readerId,
    );
    this.logger.log(
      `Middleware: Cached key authorization in Redis via RabbitMQ event`,
      'CacheEventsSubscriber',
    );
  }
}
