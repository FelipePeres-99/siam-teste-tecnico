import { InjectRepository } from "@nestjs/typeorm";
import { Device } from "../db/entities";
import { Repository } from "typeorm";

export class DeviceRepository {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>
  ) {}

  async findOneBy(criteria: Partial<Device>): Promise<Device | null> {
    return await this.deviceRepository.findOne({ where: criteria });
  }

  async findBy(criteria: Partial<Device>): Promise<Device[]> {
    return await this.deviceRepository.findBy(criteria);
  }
}
