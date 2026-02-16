import { Controller, Delete, Param, Inject, UseGuards, Post, BadRequestException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { LoggerService } from '@siam/types';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { USER_DELETE_ALL_IN_BUILDING_CMD, BUILDING_OPEN_ALL_DOORS_CMD } from '@siam/common';
import { API_BUILDINGS_PATH, API_BUILDINGS_USERS_PATH_SUFFIX } from '../constants/api.constants';     
import { MIDDLEWARE_SERVICE_TOKEN, RMQ_MESSAGE_TIMEOUT_TOKEN } from 'src/constants/tokens.constants';
import { catchError, throwError, timeout, TimeoutError } from 'rxjs';
import { HttpException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller(API_BUILDINGS_PATH)
export class BuildingController {
  constructor(
    @Inject(MIDDLEWARE_SERVICE_TOKEN) private client: ClientProxy,
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
  ) {}

  @Delete(':id/' + API_BUILDINGS_USERS_PATH_SUFFIX)
  @UseGuards(JwtAuthGuard)
  deleteAllUsers(@Param('id') id: string) {
    this.logger.log(`Requesting delete all users in building ${id} (Fire-and-forget)`, 'BuildingController');
    this.client.emit(USER_DELETE_ALL_IN_BUILDING_CMD, { buildingId: +id });
    return { status: 'Accepted', message: 'Deletion processing in background' };
  }

  // ✨ NOVA FUNCIONALIDADE 3.2 - Abrir todas as portas de um prédio
  @Post(':id/open-all')
  @UseGuards(JwtAuthGuard)
  openAllDoors(@Param('id') id: string) {
    const buildingId = parseInt(id);
    
    if (isNaN(buildingId)) {
      throw new BadRequestException('buildingId must be a valid number');
    }
    
    this.logger.log(`Opening all doors (RPC) in building ${buildingId}`, 'BuildingController');
    
    return this.client.send({ cmd: BUILDING_OPEN_ALL_DOORS_CMD }, { buildingId })
      .pipe(
        timeout(this.config.get<number>(RMQ_MESSAGE_TIMEOUT_TOKEN, 5000)),
        catchError(error => {
          if (error.status) {
            return throwError(() => new HttpException(error.message, error.status));
          }
          if (error instanceof TimeoutError) {
            return throwError(() => new HttpException('Middleware Timeout', 504));
          }
          return throwError(() => new InternalServerErrorException(error.message || 'Error opening all doors'));
        })
      );
  }
}