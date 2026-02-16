import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { UserRepository } from "./user.repository";
import { User } from "./../db/entities";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RabbitmqModule } from "../rabbitmq/rabbitmq.module";

@Module({
  imports: [TypeOrmModule.forFeature([User]), RabbitmqModule],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository],
})
export class UserModule {}
