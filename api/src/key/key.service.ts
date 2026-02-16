import { Injectable } from '@nestjs/common';
import { Key, Reader } from '@siam/types';
import { KeyRepository } from './key.repository';
import { LoggerService } from '@siam/types'

@Injectable()
export class KeyService {
  constructor(
    private readonly keyRepository: KeyRepository,
    private readonly logger: LoggerService,
  ) {}

  async findAuthorizedReadersByKeyId(keyId: string): Promise<Number[] | null> {
    this.logger.debug(`Finding authorized readers for key ID: ${keyId}`, 'KeyService');
    const readers = await this.keyRepository.findAuthorizedReadersByKeyId(keyId);
    if (readers && readers.length > 0) {
      this.logger.debug(`Found ${readers.length} authorized readers for key ${keyId}`, 'KeyService', { readerCount: readers.length });
    } else {
      this.logger.warn(`No authorized readers found for key ${keyId}`, 'KeyService');
    }
    return readers;
  }
}
