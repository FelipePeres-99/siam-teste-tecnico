import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { LoggerService } from '@siam/types';
import { MIDDLEWARE_QUEUE, RABBITMQ_URL_TOKEN } from '@siam/common';
import { EVENTS_EXCHANGE } from './constants/rabbitmq.constants';

async function bootstrap() {
  const rmqUrl = process.env[RABBITMQ_URL_TOKEN] || 'amqp://siam:siam@localhost';
  
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [rmqUrl],
      // Queue for RPC commands from API
      queue: MIDDLEWARE_QUEUE,
      queueOptions: {
        durable: false, 
      },
      // Exchange for subscribing to events
      exchange: EVENTS_EXCHANGE,
      exchangeType: 'topic',
      exchangeOptions: {
        durable: true,
      },
      noAck: true,
    },
  });
  await app.listen();
  const logger = app.get(LoggerService);
  logger.log('Middleware Service is listening for commands and events', 'Bootstrap');
}
bootstrap();
