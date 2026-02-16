import { Module } from '@nestjs/common';
import { AccessController } from './access.controller';
import { AccessService } from './access.service';
import { KeyModule } from '../key/key.module';
import { ReaderModule } from '../reader/reader.module';
import { DeviceModule } from '../device/device.module';
import { KeyAuthorizationModule } from '../key-authorization/key-authorization.module';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [
    RabbitmqModule,
    KeyModule, 
    ReaderModule, 
    DeviceModule, 
    KeyAuthorizationModule
  ],
  controllers: [AccessController],
  providers: [AccessService], // ✨ Removido AccessRepository temporariamente
})
export class AccessModule {}