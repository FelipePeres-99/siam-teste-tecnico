import { Injectable, Inject, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { LoggerService } from '@siam/types';
import { firstValueFrom } from 'rxjs';
import { AUTH_VALIDATE_CREDENTIALS_CMD, AUTH_STORE_REFRESH_TOKEN_CMD, AUTH_REVOKE_TOKENS_CMD } from '@siam/common';
import { CONFIG_JWT_ACCESS_TOKEN_EXPIRATION, CONFIG_JWT_REFRESH_SECRET, CONFIG_JWT_REFRESH_TOKEN_EXPIRATION, CONFIG_JWT_REFRESH_TOKEN_EXPIRATION_SECONDS, CONFIG_JWT_SECRET } from '../constants/auth.constants';
import { CacheService } from 'src/cache/cache.service';
import { ConfigService } from '@nestjs/config';
import { MIDDLEWARE_SERVICE_TOKEN } from 'src/constants/tokens.constants';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @Inject(MIDDLEWARE_SERVICE_TOKEN) private middlewareClient: ClientProxy,
    private readonly cacheService: CacheService,
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
  ) {}

  async login(email: string, password: string) {
    this.logger.log(`Login attempt for ${email}`, 'AuthService');

    // Validate credentials against middleware
    try {
      const user = await firstValueFrom(this.middlewareClient
        .send(AUTH_VALIDATE_CREDENTIALS_CMD, { email, password }));

      if (!user || !user.id) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const accessToken = this.generateAccessToken(user.id, user.email);
      const refreshToken = this.generateRefreshToken(user.id);

      // Store refresh token in Redis via middleware
      const refreshTokenExpiresIn = this.config.get<number>(CONFIG_JWT_REFRESH_TOKEN_EXPIRATION_SECONDS, 7 * 24 * 60 * 60);
      await this.middlewareClient
        .send(AUTH_STORE_REFRESH_TOKEN_CMD, {
          userId: user.id,
          refreshToken,
          expiresIn: refreshTokenExpiresIn,
        } as JwtSignOptions)
        .toPromise();

      this.logger.log(`User ${email} logged in successfully`, 'AuthService');

      return {
        accessToken,
        refreshToken,
        user: { id: user.id, email: user.email },
      };
    } catch (error) {
      this.logger.error(`Login failed for ${email}`, error.stack, 'AuthService');
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Login failed due to an internal error');
    }
  }

  async refresh(refreshToken: string) {
    this.logger.log('Refresh token request', 'AuthService');

    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.config.get<string>(CONFIG_JWT_REFRESH_SECRET, 'your-refresh-secret-key'),
      });

      const storedToken = await this.cacheService.get(`refresh_token:${decoded.userId}`);

      if (storedToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new access token
      const accessToken = this.generateAccessToken(decoded.userId, decoded.email);

      this.logger.log(`Token refreshed for user ${decoded.userId}`, 'AuthService');

      return {
        accessToken,
      };
    } catch (error) {
      this.logger.error('Token refresh failed', error.stack, 'AuthService');
      if (error instanceof UnauthorizedException || error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Invalid refresh token');
      }
      throw new InternalServerErrorException('Token refresh failed due to an internal error');
    }
  }

  async logout(userId: number, token: string) {
    this.logger.log(`Logout for user ${userId}`, 'AuthService');

    try {
      await this.middlewareClient
        .send(AUTH_REVOKE_TOKENS_CMD, { userId, token })
        .toPromise();

      this.logger.log(`User ${userId} logged out successfully`, 'AuthService');

      return { message: 'Logged out successfully' };
    } catch (error) {
      this.logger.error(`Logout failed for user ${userId}`, error.stack, 'AuthService');
      throw new InternalServerErrorException('Logout failed');
    }
  }

  private generateAccessToken(userId: number, email: string): string {
    const payload = {
      userId,
      email,
      type: 'access',
    };
    return this.jwtService.sign(payload, {
      secret: this.config.get<string>(CONFIG_JWT_SECRET, 'your-super-secret-key'),
      expiresIn: this.config.get<string>(CONFIG_JWT_ACCESS_TOKEN_EXPIRATION, '15m'),
    } as JwtSignOptions);
  }

  private generateRefreshToken(userId: number): string {
    const payload = {
      userId,
      type: 'refresh',
    };
    return this.jwtService.sign(payload, {
      secret: this.config.get<string>(CONFIG_JWT_REFRESH_SECRET, 'your-refresh-secret-key'),
      expiresIn: this.config.get<string>(CONFIG_JWT_REFRESH_TOKEN_EXPIRATION, '7d'),
    } as JwtSignOptions);
  }
}
