import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { LoggerService } from '@siam/types'

@Injectable()
export class DeviceService {
  constructor(
    private readonly httpService: HttpService,
    private readonly logger: LoggerService,
  ) {}

  async sendCommand(url: string, command: string) {
    try {
      // For this POC, we append /command to the base URL if needed, 
      // but the mock runs on :8101/command.
      // The DB url is 'http://localhost:8101'.
      const fullUrl = `${url}/command`;
      
      this.logger.log(`Sending HTTP POST to ${fullUrl}`, 'DeviceService');
      const response = await firstValueFrom(
        this.httpService.post(fullUrl, { command })
      );
      this.logger.log(`Device responded with ${response.status}`, 'DeviceService');
    } catch (error) {
      this.logger.error(`Error sending command: ${error.message}`, error.stack, 'DeviceService');
    }
  }
}
