import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ReaderService } from './reader.service';
import { READER_FIND_ONE_WITH_DEVICE_CMD } from '@siam/common';

@Controller()
export class ReaderController {
  constructor(private readonly readerService: ReaderService) {}

  @MessagePattern({ cmd: READER_FIND_ONE_WITH_DEVICE_CMD })
  async findOneByIdWithDevice(@Payload() data: { readerId: number }) {
    return this.readerService.findOneByIdWithDevice(data.readerId);
  }
}
