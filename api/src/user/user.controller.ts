import { Controller, Get, Inject, Param, Post, UseGuards, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices'; 
import { UserService } from './user.service';
import { LoggerService } from '@siam/types';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { API_USERS_PATH, API_ID_PATH_PARAM } from '../constants/api.constants';
import { MIDDLEWARE_SERVICE_TOKEN } from 'src/constants/tokens.constants';

@Controller(API_USERS_PATH)
export class UserController {
  constructor(
    @Inject(UserService)
    private userService: UserService,
    @Inject(MIDDLEWARE_SERVICE_TOKEN) private middlewareClient: ClientProxy,
    private readonly logger: LoggerService, 
  ) {}

  @Get(API_ID_PATH_PARAM)
  @UseGuards(JwtAuthGuard)
  async findById(@Param('id') id: number) {
    this.logger.log(`Getting user ${id} directly from DB`, 'UserController');
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

}
