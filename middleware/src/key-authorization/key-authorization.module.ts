import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { KeyAuthorization } from "../db/entities";
import { KeyAuthorizationRepository } from "./key-authorization.repository";
import { KeyAuthorizationService } from "./key-authorization.service";
import { RabbitmqModule } from "src/rabbitmq/rabbitmq.module";

@Module({
  imports: [TypeOrmModule.forFeature([KeyAuthorization]), RabbitmqModule],
  providers: [KeyAuthorizationRepository, KeyAuthorizationService],
  exports: [KeyAuthorizationService, KeyAuthorizationRepository],
})
export class KeyAuthorizationModule {}
