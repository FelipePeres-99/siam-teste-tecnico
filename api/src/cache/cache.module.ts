import { Module } from "@nestjs/common";
import { CacheService } from "./cache.service";
import { RedisCacheService } from "./redis-cache.service";
import { CacheController } from "./cache.controller";
import Redis from "ioredis";
import { RabbitmqModule } from "src/rabbitmq/rabbitmq.module";
import { REDIS_HOST_TOKEN, REDIS_PORT_TOKEN, REDIS_CLIENT_TOKEN } from '@siam/common';
import { ConfigService } from "@nestjs/config";

@Module({
  imports: [RabbitmqModule],
  controllers: [CacheController],
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
