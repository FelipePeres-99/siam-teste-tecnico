import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { LoggerModule } from '@siam/common';
import { AccessModule } from "./access/access.module";
import { ReaderModule } from "./reader/reader.module";
import { UserModule } from "./user/user.module";
import { BuildingModule } from "./building/building.module";
import { RabbitmqModule } from "./rabbitmq/rabbitmq.module";
import { KeyModule } from "./key/key.module";
import { CacheModule } from "./cache/cache.module";
import { DoorModule } from "./door/door.module";
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule,
    AccessModule,
    ReaderModule,
    UserModule,
    BuildingModule,
    RabbitmqModule,
    KeyModule,
    CacheModule, 
    DoorModule,
    AuthModule,
  ],
  controllers: [],
  exports: [LoggerModule],
})
export class AppModule {}
