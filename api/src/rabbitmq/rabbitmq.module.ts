import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MIDDLEWARE_QUEUE, RABBITMQ_URL_TOKEN } from '@siam/common';
import { MIDDLEWARE_SERVICE_TOKEN } from 'src/constants/tokens.constants';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: MIDDLEWARE_SERVICE_TOKEN,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.get<string>(RABBITMQ_URL_TOKEN, 'amqp://siam:siam@localhost')],
            queue: MIDDLEWARE_QUEUE,
            queueOptions: {
              durable: false,
            },
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class RabbitmqModule {}