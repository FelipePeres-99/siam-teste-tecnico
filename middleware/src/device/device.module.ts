import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Device } from "../db/entities";
import { DeviceRepository } from "./device.repository";
import { DeviceService } from "./device.service";

@Module({
  imports: [TypeOrmModule.forFeature([Device])],
  providers: [DeviceRepository, DeviceService],
  exports: [DeviceService],
})
export class DeviceModule {}
