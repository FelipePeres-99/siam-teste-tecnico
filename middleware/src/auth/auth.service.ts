import { Injectable, UnauthorizedException, InternalServerErrorException, Inject } from '@nestjs/common';
import { UserRepository } from '../user/user.repository';
import { LoggerService } from '@siam/types';
import * as bcrypt from 'bcrypt';
import { CacheService } from 'src/cache/cache.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly cacheService: CacheService,
    private readonly logger: LoggerService,
  ) {}

  async validateCredentials(email: string, password: string) {
    this.logger.log(
      `Validating credentials for ${email}`,
      'AuthService',
    );

    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    this.logger.log(`Credentials validated for user ${user.userId}`, 'AuthService');
    return {
      id: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  async storeRefreshToken(userId: number, refreshToken: string, expiresIn: number) {
    this.logger.log(
      `Storing refresh token for user ${userId}`,
      'AuthService',
    );

    try {
      await this.cacheService.setRefreshToken(userId, refreshToken, expiresIn);
      this.logger.log(
        `Refresh token stored for user ${userId}`,
        'AuthService',
      );

      return { success: true };
    } catch (error) {
      this.logger.error(
        `Failed to store refresh token for user ${userId}`,
        error.stack,
        'AuthService',
      );
      throw new InternalServerErrorException('Failed to store refresh token');
    }
  }

  async revokeTokens(userId: number, token: string) {
    this.logger.log(`Revoking tokens for user ${userId}`, 'AuthService');

    try {
      await this.cacheService.setTokenToBlacklist(token);
      await this.cacheService.revokeRefreshToken(userId);

      return { success: true };
    } catch (error) {
      this.logger.error(
        `Failed to revoke tokens for user ${userId}`,
        error.stack,
        'AuthService',
      );
      throw new InternalServerErrorException('Failed to revoke tokens');
    }
  }

  
}

