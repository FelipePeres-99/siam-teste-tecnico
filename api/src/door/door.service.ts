import { Injectable } from '@nestjs/common';
import { Door } from '@siam/types';
import { DoorRepository } from './door.repository';
import { LoggerService } from '@siam/types'

@Injectable()
export class DoorService {
  constructor(
    private readonly doorRepository: DoorRepository,
    private readonly logger: LoggerService,
  ) {}

  async findReadersByDoorId(doorId: string): Promise<Door[] | null> {
    this.logger.debug(`Finding readers for door ID: ${doorId}`, 'DoorService');
    const readers = await this.doorRepository.findReadersByDoorId(doorId);
    if (readers && readers.length > 0) {
      this.logger.debug(`Found ${readers.length} readers for door ${doorId}`, 'DoorService', { readerCount: readers.length });
    } else {
      this.logger.warn(`No readers found for door ${doorId}`, 'DoorService');
    }
    return readers;
  }
}
