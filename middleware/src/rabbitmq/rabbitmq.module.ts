import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RABBITMQ_URL_TOKEN, DEVICE_QUEUE } from '@siam/common';
import { EVENT_BUS_SERVICE_TOKEN } from "../constants/tokens.constants";
import { DEVICE_COMM_SERVICE_TOKEN, EVENTS_EXCHANGE } from 'src/constants/rabbitmq.constants';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: DEVICE_COMM_SERVICE_TOKEN,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.get<string>(RABBITMQ_URL_TOKEN, 'amqp://siam:siam@localhost')],
            queue: DEVICE_QUEUE,
            queueOptions: {
              durable: false,
            },
          },
        }),
      },
      {
        name: EVENT_BUS_SERVICE_TOKEN,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.get<string>(RABBITMQ_URL_TOKEN, 'amqp://siam:siam@localhost')],
            exchange: EVENTS_EXCHANGE,
            exchangeType: 'topic',
            exchangeOptions: {
              durable: true,
            },
            noAck: true,
            queue: '',
            queueOptions: {
              durable: true,
            },
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class RabbitmqModule {}
