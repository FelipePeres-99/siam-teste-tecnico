import { Key, User } from "@siam/types";
import { UserRepository } from "./user.repository";
import { Inject, Injectable } from "@nestjs/common";
import { LoggerService } from '@siam/types'

@Injectable()
export class UserService {
  constructor(
    @Inject(UserRepository) private readonly userRepo: UserRepository,
    private readonly logger: LoggerService,
  ) {}

  async findById(id: number): Promise<User | null> {
    this.logger.debug(`Finding user by ID: ${id}`, 'UserService');
    const user = await this.userRepo.findById(id);
    if (user) {
      this.logger.debug(`User found: ${user.userId}`, 'UserService', { userId: user.userId });
    } else {
      this.logger.warn(`User not found for ID: ${id}`, 'UserService');
    }
    return user;
  }

   async findKeysByUserId(id: number): Promise<Key[] | null> {
    this.logger.debug(`Finding keys for user ID: ${id}`, 'UserService');
    const keys = await this.userRepo.findKeysByUserId(id);
    if (keys && keys.length > 0) {
      this.logger.debug(`Found ${keys.length} keys for user ${id}`, 'UserService', { keyCount: keys.length });
    } else {
      this.logger.warn(`No keys found for user ${id}`, 'UserService');
    }
    return keys;
  }

}
