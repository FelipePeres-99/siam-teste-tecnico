import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService } from '@siam/types';
import { API_PORT_TOKEN } from './constants/tokens.constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const port = process.env[API_PORT_TOKEN] || 3000;
  await app.listen(port);
  const logger = app.get(LoggerService);
  logger.log(`API Service listening on port ${port}`, 'Bootstrap');
}
bootstrap();
