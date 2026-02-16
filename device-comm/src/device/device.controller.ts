import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { DeviceService } from './device.service';
import { LoggerService } from '@siam/types';
import { DEVICE_EXECUTE_CMD } from '@siam/common';

@Controller()
export class DeviceController {
  constructor(
    private readonly deviceService: DeviceService,
    private readonly logger: LoggerService,
  ) {}

  @EventPattern(DEVICE_EXECUTE_CMD)
  async handleCommand(@Payload() data: { url: string; command: string; doorId: number }) {
    this.logger.log(`Received command for ${data.url}`, 'DeviceController');
    await this.deviceService.sendCommand(data.url, data.command);
  }
}
