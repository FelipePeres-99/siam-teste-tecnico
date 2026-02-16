import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { LoggerService } from '@siam/types';
import { DEVICE_QUEUE, RABBITMQ_URL_TOKEN } from '@siam/common';

async function bootstrap() {
  const rmqUrl = process.env[RABBITMQ_URL_TOKEN] || 'amqp://siam:siam@localhost';

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [rmqUrl], 
      queue: DEVICE_QUEUE,
      queueOptions: {
        durable: false,
      },
    },
  });
  await app.listen();
  const logger = app.get(LoggerService);
  logger.log('Device-Comm Service is listening', 'Bootstrap');
}
bootstrap();
