import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { UserRepository } from "./user.repository";
import { RabbitmqModule } from "../rabbitmq/rabbitmq.module";
import { CacheModule } from "../cache/cache.module";

@Module({
  imports: [
    RabbitmqModule,
    CacheModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports:[UserService],
})
export class UserModule {}
