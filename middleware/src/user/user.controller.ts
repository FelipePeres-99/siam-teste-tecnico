import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { UserService } from "./user.service";
import { USER_DELETE_ALL_IN_BUILDING_CMD } from '@siam/common';
import { LoggerService } from "@siam/types";

@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly logger: LoggerService
  ) {}

  @EventPattern(USER_DELETE_ALL_IN_BUILDING_CMD)
  async deleteAllUsers(@Payload() data: { buildingId: number }) {
    this.logger.log(
      `Middleware: Deleting all users in building ${data.buildingId}`,
    );
    await this.userService.deleteAllInBuilding(data.buildingId);
  }
}
