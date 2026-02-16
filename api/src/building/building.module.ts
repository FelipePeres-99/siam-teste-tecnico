import { Module } from '@nestjs/common';
import { BuildingController } from './building.controller';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitmqModule],
  controllers: [BuildingController],
})
export class BuildingModule {}
