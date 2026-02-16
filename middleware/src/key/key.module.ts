import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Key } from "../db/entities";
import { KeyRepository } from "./key.repository";
import { KeyService } from "./key.service";
import { RabbitmqModule } from "src/rabbitmq/rabbitmq.module";

@Module({
  imports: [TypeOrmModule.forFeature([Key]), RabbitmqModule],
  providers: [KeyRepository, KeyService],
  exports: [KeyService, KeyRepository],
})
export class KeyModule {}
