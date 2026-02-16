import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';
import { CacheModule } from 'src/cache/cache.module';
import { ConfigService } from '@nestjs/config';
import { CONFIG_JWT_ACCESS_TOKEN_EXPIRATION, CONFIG_JWT_SECRET } from '../constants/auth.constants';
import { StringValue } from 'ms';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>(CONFIG_JWT_SECRET, 'your-super-secret-key'),
        signOptions: { 
          expiresIn: config.get<string>(CONFIG_JWT_ACCESS_TOKEN_EXPIRATION, '15m') as StringValue
        },
      }),
    }),
    PassportModule,
    CacheModule,
    RabbitmqModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
