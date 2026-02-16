import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { LoggerService } from '@siam/types';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { API_READERS_PATH } from '../constants/api.constants';
import { ReaderService } from './reader.service';

@Controller(API_READERS_PATH)
export class ReaderController {
  constructor(
    private readonly readerService: ReaderService,
    private readonly logger: LoggerService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findReaderWithDevice(@Query('readerId') readerId: number) {
    this.logger.log(`Getting reader with device for Reader ${readerId}`, 'ReaderController');
    return this.readerService.findReaderWithDevice(readerId);
  }
}
