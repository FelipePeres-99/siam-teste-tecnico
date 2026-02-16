import { Controller, Post, Body, UseGuards, BadRequestException, Get, Param } from '@nestjs/common';
import { AccessService } from './access.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { API_ACCESS_GRANT_PATH, API_ACCESS_PATH, API_ACCESS_OPEN_PATH } from '../constants/api.constants';

@Controller(API_ACCESS_PATH)
export class AccessController {
  constructor(private readonly accessService: AccessService) {}

  @Post(API_ACCESS_GRANT_PATH)
  @UseGuards(JwtAuthGuard)
  grantAccess(@Body() data: { userId: number; doorId: number }) {
    if (!data.userId || !data.doorId) {
      throw new BadRequestException('userId and doorId are required');
    }
    return this.accessService.grantAccess(data.userId, data.doorId);
  }

  @Post(API_ACCESS_OPEN_PATH)
  @UseGuards(JwtAuthGuard)
  async openDoor(@Body() data: { userId: number; doorId: number }) {
    if (!data.userId || !data.doorId) {
      throw new BadRequestException('userId and doorId are required');
    }
    return this.accessService.openDoor(data.userId, data.doorId);
  }

  // ✨ NOVA FUNCIONALIDADE 3.1 - Buscar acessos de usuário em prédio específico
  @Get('user/:userId/building/:buildingId')
  @UseGuards(JwtAuthGuard)
  async getUserAccessesInBuilding(
    @Param('userId') userId: string, 
    @Param('buildingId') buildingId: string
  ) {
    const userIdNum = parseInt(userId);
    const buildingIdNum = parseInt(buildingId);
    
    if (isNaN(userIdNum) || isNaN(buildingIdNum)) {
      throw new BadRequestException('userId and buildingId must be valid numbers');
    }
    
    return this.accessService.getUserAccessesInBuilding(userIdNum, buildingIdNum);
  }
}