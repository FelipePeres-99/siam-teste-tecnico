import { Module } from "@nestjs/common";
import { RedisCacheService } from "./redis-cache.service";
import { CacheEventsSubscriber } from "./cache-events.subscriber";
import { UserModule } from "../user/user.module";
import { ReaderModule } from "../reader/reader.module";
import { KeyModule } from "../key/key.module";
import { KeyAuthorizationModule } from "../key-authorization/key-authorization.module";
import { CacheController } from "./cache.controller";
import { CacheService } from "./cache.service";
import Redis from "ioredis";
import { REDIS_HOST_TOKEN, REDIS_PORT_TOKEN, REDIS_CLIENT_TOKEN } from "@siam/common";
import { ConfigService } from "@nestjs/config";

@Module({
  imports: [UserModule, ReaderModule, KeyModule, KeyAuthorizationModule],
  controllers: [CacheController, CacheEventsSubscriber],
  providers: [
    {
      provide: REDIS_CLIENT_TOKEN,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return new Redis({
          host: config.get<string>(REDIS_HOST_TOKEN, "localhost"),
          port: config.get<number>(REDIS_PORT_TOKEN, 6379),
        });
      },
    },
    {
      provide: CacheService,
      useClass: RedisCacheService,
    },
  ],
  exports: [CacheService],
})
export class CacheModule {}
