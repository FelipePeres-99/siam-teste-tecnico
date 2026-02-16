import { Inject, Injectable } from "@nestjs/common";
import { UserRepository } from "./user.repository";
import { User } from "../db/entities";
import { ClientProxy } from "@nestjs/microservices";
import { LoggerService } from '@siam/types'
import { EVENT_BUS_SERVICE_TOKEN } from "../constants/tokens.constants";
import { USER_CREATED_EVENT, USERS_DELETED_EVENT } from "src/constants/events.constants";

@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    @Inject(EVENT_BUS_SERVICE_TOKEN) private readonly eventBusService: ClientProxy,
    private readonly logger: LoggerService,
  ) {}
  async findAll(): Promise<User[]> {
    return this.userRepo.findAll();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findByEmail(email);
  }
  async create(userData: Partial<User>) {
    const user = await this.userRepo.save(userData);
    this.eventBusService.emit(USER_CREATED_EVENT, user);
    this.logger.log(`Created user ${user.userId} and emitted event`, 'UserService');
    return user;
  }

  async deleteAllInBuilding(buildingId: number) {
    const users = await this.userRepo.findAllInBuilding(buildingId);

    await this.userRepo.deleteAllInBuilding(buildingId);
    this.logger.log(`Deleted users for building ${buildingId} from DB`, 'UserService');

    if (users.length > 0) {
      const keys = users.map((user) => `user:${user.userId}`);
      this.eventBusService.emit(USERS_DELETED_EVENT, keys);
      this.logger.log(
        `Middleware: Emitted event to invalidate cache for users: ${keys.join(
          ', ',
        )}`,
        'UserService',
      );
    }
  }
}
