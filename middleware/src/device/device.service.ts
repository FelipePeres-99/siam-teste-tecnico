import { Inject, Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Device } from "../db/entities";
import { DeviceRepository } from "./device.repository";
import { LoggerService } from '@siam/types'
import { DEVICE_GET_BASIC_CONFIG_CMD, READER_CHECK_CONFIGURATION_CMD } from "src/constants/events.constants";

@Injectable()
export class DeviceService {
  constructor(
    @Inject(DeviceRepository)
    private readonly deviceRepository: DeviceRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: LoggerService,
  ) {}

  async findOneBy(criteria: Partial<Device>): Promise<Device | null> {
    return await this.deviceRepository.findOneBy(criteria);
  }

  async findBy(criteria: Partial<Device>): Promise<Device[]> {
    return await this.deviceRepository.findBy(criteria);
  }

  @OnEvent(DEVICE_GET_BASIC_CONFIG_CMD)
  async handleGetBasicConfig(payload: {
    deviceId: number;
  }): Promise<Device | null> {
    this.logger.log(
      `Getting basic configuration for device ${payload.deviceId}`,
      'DeviceService'
    );

    return await this.findOneBy({ deviceId: payload.deviceId });
  }
  // This function was created to exemplify the use of EventEmitter
  // and how to avoid direct coupling between services,
  // thus eliminating the need for forwardRef.
  async validateReaderIsConfigured(readerId: number): Promise<boolean> {
    try {
      const isConfigured = await this.eventEmitter.emitAsync(
        READER_CHECK_CONFIGURATION_CMD,
        { readerId }
      );
      return isConfigured && isConfigured[0] === true;
    } catch (error) {
      this.logger.error("Error validating reader:", error.stack, 'DeviceService');
      return false;
    }
  }
}
