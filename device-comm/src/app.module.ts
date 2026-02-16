import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { LoggerModule } from '@siam/common';
import { DeviceController } from './device/device.controller';
import { DeviceService } from './device/device.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), HttpModule, LoggerModule],
  controllers: [DeviceController],
  providers: [DeviceService],
  exports: [LoggerModule],
})
export class AppModule {}
