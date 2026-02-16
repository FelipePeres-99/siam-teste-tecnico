import { Controller } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";
import { CacheService } from "./cache.service";
import { CACHE_POPULATE_ALL_CACHES_CMD } from "@siam/common";
import { LoggerService } from "@siam/types";

@Controller()
export class CacheController {
  constructor(
    private readonly cacheService: CacheService,
    private readonly logger: LoggerService,
  ) {}

  @MessagePattern(CACHE_POPULATE_ALL_CACHES_CMD)
  async populateAllCaches() {
    this.logger.log("Middleware: Received request to populate all caches");
    return this.cacheService.populateAllCaches();
  }
}
