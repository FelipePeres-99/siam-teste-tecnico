import { Inject, Injectable } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { ReaderService } from "../reader/reader.service";
import { KeyService } from "../key/key.service";
import { KeyAuthorizationService } from "../key-authorization/key-authorization.service";
import {
  Key,
  KeyAuthorization,
  LoggerService,
  Reader,
  User,
} from "@siam/types";
import { CacheService } from "./cache.service";
import Redis from "ioredis";
import { REDIS_CLIENT_TOKEN } from '@siam/common';
import { ConfigService } from "@nestjs/config";
import { REDIS_TTL_BLACKLIST_SECONDS_TOKEN } from "src/constants/tokens.constants";

@Injectable()
export class RedisCacheService extends CacheService {
  constructor(
    @Inject(REDIS_CLIENT_TOKEN) private readonly redis: Redis,
    private readonly userService: UserService,
    private readonly readerService: ReaderService,
    private readonly keyService: KeyService,
    private readonly keyAuthorizationService: KeyAuthorizationService,
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  async populateUserCache() {
    this.logCacheStart("Users");
    const users = await this.userService.findAll();
    const results = await this.cacheUsersInRedis(users);
    const summary = this.calculateCacheSummary(results);
    this.logCacheSummary(summary, "users");
    return summary.successCount;
  }

  private logCacheStart(entity: string) {
    this.logger.log(
      `Middleware: Starting ${entity} cache population...`,
      "CacheService",
    );
  }

  private async cacheUsersInRedis(users: User[]) {
    const pipeline = this.createUserRedisPipeline(users);
    return await pipeline.exec();
  }

  private async cacheReadersInRedis(readers: Reader[]) {
    const pipeline = this.createReaderRedisPipeline(readers);
    return await pipeline.exec();
  }
  private async cacheKeysInRedis(keys: Key[]) {
    const pipeline = this.createKeyRedisPipeline(keys);
    return await pipeline.exec();
  }

  private async cacheKeyAuthorizationsInRedis(keys: KeyAuthorization[]) {
    const pipeline = this.createKeyAuthorizationRedisPipeline(keys);
    return await pipeline.exec();
  }

  private createKeyAuthorizationRedisPipeline(keyAuth: KeyAuthorization[]) {
    const pipeline = this.redis.pipeline();
    const authsByKey: Record<string, string[]> = {};

    for (const auth of keyAuth) {
      if (auth.allowed) {
        if (!authsByKey[auth.keyId]) {
          authsByKey[auth.keyId] = [];
        }
        authsByKey[auth.keyId].push(auth.readerId.toString());
      }
    }

    for (const keyId in authsByKey) {
      // For each key, store a set of reader IDs it is authorized for.
      pipeline.sadd(`key:${keyId}:authorized_readers`, ...authsByKey[keyId]);
    }
    keyAuth.forEach((key) => {
      pipeline.set(`key:${key.keyId}`, JSON.stringify(key));
    });
    return pipeline;
  }

  private createKeyRedisPipeline(keys: Key[]) {
    const pipeline = this.redis.pipeline();
    const keysByUser: Record<string, Key[]> = {};

    for (const key of keys) {
      if (!keysByUser[key.userId]) {
        keysByUser[key.userId] = [];
      }
      keysByUser[key.userId].push(key);
    }
    for (const userId in keysByUser) {
      pipeline.set(`user:${userId}:keys`, JSON.stringify(keysByUser[userId]));
    }
    return pipeline;
  }

  private createUserRedisPipeline(users: User[]) {
    const pipeline = this.redis.pipeline();
    users.forEach((user) => {
      pipeline.set(`user:${user.userId}`, JSON.stringify(user));
    });
    return pipeline;
  }

  private createReaderRedisPipeline(readers: Reader[]) {
    const pipeline = this.redis.pipeline();
    const readersByDoor: Record<string, Reader[]> = {};

    for (const reader of readers) {
      if (reader.doorDeviceId) {
        if (!readersByDoor[reader.doorDeviceId]) {
          readersByDoor[reader.doorDeviceId] = [];
        }
        readersByDoor[reader.doorDeviceId].push(reader);
      }
    }

    for (const doorId in readersByDoor) {
      pipeline.set(
        `door:${doorId}:readers`,
        JSON.stringify(readersByDoor[doorId]),
      );
    }
    return pipeline;
  }

  private calculateCacheSummary(results: any[]) {
    let successfulCaches = 0;
    let failedCaches = 0;

    for (const [error, _] of results) {
      if (error) {
        this.logCacheError(error);
        failedCaches++;
        continue;
      }
      successfulCaches++;
    }

    return {
      success: failedCaches === 0,
      successCount: successfulCaches,
      failedCount: failedCaches,
    };
  }

  private logCacheError(error: Error) {
    this.logger.error(
      `Failed to cache: ${error.message}`,
      error.stack,
      "CacheService",
    );
  }

  private logCacheSummary(
    summary: { success: boolean; successCount: number; failedCount: number },
    entity: string,
  ) {
    if (!summary.success) {
      this.logCacheFailure(
        summary.failedCount,
        summary.successCount + summary.failedCount,
        entity,
      );
      return;
    }
    this.logCacheSuccess(
      summary.successCount,
      summary.successCount + summary.failedCount,
      entity,
    );
  }

  private logCacheFailure(
    failedCount: number,
    totalEntities: number,
    entity: string,
  ) {
    this.logger.error(
      `Failed to populate ${entity} cache. ${failedCount} operations failed. Total ${entity}: ${totalEntities}.`,
      "",
      "CacheService",
    );
  }

  private logCacheSuccess(
    successCount: number,
    totalEntities: number,
    entity: string,
  ) {
    this.logger.log(
      `Cached ${successCount} ${entity}. Total ${entity}: ${totalEntities}.`,
      "",
      "CacheService",
    );
    this.logger.debug(`Cached ${successCount} ${entity}.`, "CacheService");
  }

  async populateReaderCache() {
    this.logCacheStart("Readers");
    const readers = await this.readerService.findAll();
    const results = await this.cacheReadersInRedis(readers);
    const summary = this.calculateCacheSummary(results);
    this.logCacheSummary(summary, "readers");
    return summary.successCount;
  }

  async populateKeyCache() {
    this.logCacheStart("Keys");
    const keys = await this.keyService.findAll();
    const results = await this.cacheKeysInRedis(keys);
    const summary = this.calculateCacheSummary(results);
    this.logCacheSummary(summary, "keys");
    return summary.successCount;
  }

  async populateKeyAuthorizationCache() {
    this.logCacheStart("Key Authorizations");
    const keysAuth = await this.keyAuthorizationService.findAll();
    const results = await this.cacheKeyAuthorizationsInRedis(keysAuth);
    const summary = this.calculateCacheSummary(results);
    this.logCacheSummary(summary, "Key Authorizations");
    return summary.successCount;
  }

  async populateAllCaches() {
    this.logger.log(
      "Starting cache population for all entities...",
      "CacheService",
    );
    const userCachedCount = await this.populateUserCache();
    const readerCachedCount = await this.populateReaderCache();
    const keyCachedCount = await this.populateKeyCache();
    const keyAuthCachedCount = await this.populateKeyAuthorizationCache();

    this.logger.log("Finished populating all caches.", "CacheService");
    return {
      success: true,
      users: userCachedCount,
      readers: readerCachedCount,
      keys: keyCachedCount,
      authorizations: keyAuthCachedCount,
    };
  }

  async setRefreshToken(
    userId: number,
    refreshToken: string,
    expiresIn: number,
  ) {
    return await this.redis.set(
      `refresh_token:${userId}`,
      refreshToken,
      "EX",
      expiresIn,
    );
  }

  async setTokenToBlacklist(token: string) {
    const tokenHash = require("crypto")
      .createHash("sha256")
      .update(token)
      .digest("hex");
    const ttl = this.configService.get<number>(REDIS_TTL_BLACKLIST_SECONDS_TOKEN, 900);
    return await this.redis.set(
      `blacklist:${tokenHash}`,
      "revoked",
      "EX",
      ttl,
    );
  }

  async revokeRefreshToken(userId: number) {
    const result = await this.redis.del(`refresh_token:${userId}`);
    this.logger.log(`Tokens revoked for user ${userId}`);
    return result;
  }

  pipeline() {
    return this.redis.pipeline();
  }

  async set(key: string, value: string, ...args: any[]): Promise<any> {
    return await this.redis.set(key, value, ...args);
  }

  async del(...keys: string[]): Promise<number> {
    return await this.redis.del(...keys);
  }
  async sadd(key: string, ...members: (string | number)[]): Promise<number> {
    return await this.redis.sadd(key, ...members);
  }
}
