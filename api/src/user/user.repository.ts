import { Key, User } from "@siam/types";
import { Injectable } from "@nestjs/common";
import { CacheService } from "../cache/cache.service";
@Injectable()
export class UserRepository {
  constructor(private readonly cache: CacheService) {}
  async findById(id: number): Promise<User | null> {
    return await this.cache.get(`user:${id}`);
  }

  async findKeysByUserId(id: number): Promise<Key[] | null> {
   return await this.cache.get(`user:${id}:keys`);
  }
}
