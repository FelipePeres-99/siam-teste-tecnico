import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Reader } from "../db/entities";
import { ReaderRepository } from "./reader.repository";
import { ReaderService } from "./reader.service";
import { ReaderController } from './reader.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Reader])],
  controllers: [ReaderController],
  providers: [ReaderRepository, ReaderService],
  exports: [ReaderService, ReaderRepository],
})
export class ReaderModule {}
