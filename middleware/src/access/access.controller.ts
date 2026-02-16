import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AccessService } from './access.service';
import { ACCESS_GRANT_CMD, DOOR_TRIGGER_OPEN_CMD, ACCESS_GET_USER_ACCESSES_IN_BUILDING_CMD, BUILDING_OPEN_ALL_DOORS_CMD } from '@siam/common';
import { LoggerService } from '@siam/types';

@Controller()
export class AccessController {
  constructor(private readonly accessService: AccessService, private readonly logger: LoggerService) {}

  @MessagePattern({ cmd: ACCESS_GRANT_CMD })
  async grantAccess(@Payload() data: { userId: number; doorId: number }) {
    this.logger.log(`Middleware: Processing Grant Access for User ${data.userId} Door ${data.doorId}`);
    return await this.accessService.grantAccess(data.userId, data.doorId);
  }

  @MessagePattern({ cmd: DOOR_TRIGGER_OPEN_CMD })
  async triggerDoorOpen(@Payload() data: { doorId: number }) {
    this.logger.log(`Middleware: Processing Trigger Open Door for Door ${data.doorId}`);
    return await this.accessService.triggerDoorOpen(data.doorId);
  }

  // ✨ NOVA FUNCIONALIDADE 3.1 - Buscar acessos de usuário em prédio específico
  @MessagePattern({ cmd: ACCESS_GET_USER_ACCESSES_IN_BUILDING_CMD })
  async getUserAccessesInBuilding(@Payload() data: { userId: number; buildingId: number }) {
    this.logger.log(`Middleware: Getting access events for User ${data.userId} in Building ${data.buildingId}`);
    return await this.accessService.getUserAccessesInBuilding(data.userId, data.buildingId);
  }

  // ✨ NOVA FUNCIONALIDADE 3.2 - Abrir todas as portas de um prédio
  @MessagePattern({ cmd: BUILDING_OPEN_ALL_DOORS_CMD })
  async openAllDoorsInBuilding(@Payload() data: { buildingId: number }) {
    this.logger.log(`Middleware: Opening all doors in Building ${data.buildingId}`);
    return await this.accessService.openAllDoorsInBuilding(data.buildingId);
  }
}