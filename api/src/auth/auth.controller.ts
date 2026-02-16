import { Controller, Post, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';
import { API_AUTH_PATH, API_AUTH_LOGIN_PATH, API_AUTH_REFRESH_PATH, API_AUTH_LOGOUT_PATH } from '../constants/api.constants';

@Controller(API_AUTH_PATH)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post(API_AUTH_LOGIN_PATH)
  async login(@Body() credentials: { email: string; password: string }) {
    if (!credentials.email || !credentials.password) {
      throw new BadRequestException('Email and password are required');
    }
    return this.authService.login(credentials.email, credentials.password);
  }

  @Post(API_AUTH_REFRESH_PATH)
  async refresh(@Body() body: { refreshToken: string }) {
    if (!body.refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }
    return this.authService.refresh(body.refreshToken);
  }

  @Post(API_AUTH_LOGOUT_PATH)
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req: any) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.authService.logout(req.user.userId, token);
  }
}
