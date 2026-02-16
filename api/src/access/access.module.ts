import { Module } from '@nestjs/common';
import { AccessController } from './access.controller';
import { AccessService } from './access.service';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';
import { ReaderModule } from '../reader/reader.module';
import { KeyModule } from '../key/key.module';
import { DoorModule } from '../door/door.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [ReaderModule, RabbitmqModule, DoorModule, KeyModule, UserModule],
  controllers: [AccessController],
  providers: [AccessService],
})
export class AccessModule {}
