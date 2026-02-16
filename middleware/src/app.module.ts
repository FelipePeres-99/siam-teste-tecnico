import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { LoggerModule } from "@siam/common";
import {
  User,
  Key,
  KeyAuthorization,
  Device,
  Door,
  Reader,
  AccessEvent,
} from "./db/entities";
import { UserModule } from "./user/user.module";
import { KeyModule } from "./key/key.module";
import { KeyAuthorizationModule } from "./key-authorization/key-authorization.module";
import { ReaderModule } from "./reader/reader.module";
import { DeviceModule } from "./device/device.module";
import { AccessModule } from "./access/access.module";
import { CacheModule } from "./cache/cache.module";
import { RabbitmqModule } from "./rabbitmq/rabbitmq.module";
import { AuthModule } from "./auth/auth.module";

import {
  DB_TOKEN,
  DB_HOST_TOKEN,
  DB_PASSWORD_TOKEN,
  DB_PORT_TOKEN,
  DB_USERNAME_TOKEN,
} from "./constants/database.constants";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule,
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        host: config.get<string>(DB_HOST_TOKEN, "localhost"),
        port: config.get<number>(DB_PORT_TOKEN, 5432),
        username: config.get<string>(DB_USERNAME_TOKEN, "postgres"),
        password: config.get<string>(DB_PASSWORD_TOKEN, "siam"),
        database: config.get<string>(DB_TOKEN, "siam"),
        schema: "device_comm_example",
        synchronize: false,
        entities: [User, Key, KeyAuthorization, Device, Door, Reader, AccessEvent],
      }),
    }),
    TypeOrmModule.forFeature([
      User,
      Key,
      KeyAuthorization,
      Device,
      Door,
      Reader,
      AccessEvent,
    ]),
    RabbitmqModule,
    UserModule,
    KeyModule,
    KeyAuthorizationModule,
    ReaderModule,
    DeviceModule,
    AccessModule,
    CacheModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
  exports: [LoggerModule],
})
export class AppModule {} // ✨ ADICIONAR EXPORT AQUI