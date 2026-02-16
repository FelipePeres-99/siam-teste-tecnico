import { Injectable, Inject } from '@nestjs/common';
import { ReaderRepository } from './reader.repository';
import { Reader, LoggerService } from '@siam/types';
import { ClientProxy } from '@nestjs/microservices';
import { timeout } from 'rxjs';
import { READER_FIND_ONE_WITH_DEVICE_CMD } from '@siam/common';
import { ConfigService } from '@nestjs/config';
import { MIDDLEWARE_SERVICE_TOKEN, RMQ_MESSAGE_TIMEOUT_TOKEN } from 'src/constants/tokens.constants';

@Injectable()
export class ReaderService {
  constructor(
    private readonly readerRepository: ReaderRepository,
    @Inject(MIDDLEWARE_SERVICE_TOKEN) private client: ClientProxy,
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
  ) {}

  async find(readerId: string): Promise<Reader | null> {
    return this.readerRepository.findById(readerId);
  }

  findReaderWithDevice(readerId: number) {
    this.logger.log(`Getting reader with device for Reader ${readerId}`, 'ReaderService');
    const rmqTimeout = this.config.get<number>(RMQ_MESSAGE_TIMEOUT_TOKEN, 5000);
    return this.client.send({ cmd: READER_FIND_ONE_WITH_DEVICE_CMD }, { readerId }).pipe(timeout(rmqTimeout));
  }
}
