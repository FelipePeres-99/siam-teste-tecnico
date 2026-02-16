import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { AUTH_VALIDATE_CREDENTIALS_CMD, AUTH_STORE_REFRESH_TOKEN_CMD, AUTH_REVOKE_TOKENS_CMD } from '@siam/common';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(AUTH_VALIDATE_CREDENTIALS_CMD)
  async validateCredentials(
    @Payload() data: { email: string; password: string },
  ) {
    return this.authService.validateCredentials(data.email, data.password);
  }

  @MessagePattern(AUTH_STORE_REFRESH_TOKEN_CMD)
  async storeRefreshToken(
    @Payload() data: { userId: number; refreshToken: string; expiresIn: number },
  ) {
    return this.authService.storeRefreshToken(
      data.userId,
      data.refreshToken,
      data.expiresIn,
    );
  }

  @MessagePattern(AUTH_REVOKE_TOKENS_CMD)
  async revokeTokens(@Payload() data: { userId: number; token: string }) {
    return this.authService.revokeTokens(data.userId, data.token);
  }
}
