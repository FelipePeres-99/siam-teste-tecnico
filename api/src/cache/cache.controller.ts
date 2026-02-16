import { Controller, Inject, Post, UseGuards, InternalServerErrorException } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { LoggerService } from "@siam/types";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { firstValueFrom } from "rxjs";
import { CACHE_POPULATE_ALL_CACHES_CMD } from '@siam/common';
import { API_CACHE_PATH, API_CACHE_POPULATE_PATH } from '../constants/api.constants';
import { MIDDLEWARE_SERVICE_TOKEN } from "src/constants/tokens.constants";

@Controller(API_CACHE_PATH)
export class CacheController {
  constructor(
    @Inject(MIDDLEWARE_SERVICE_TOKEN) private middlewareClient: ClientProxy,
    private readonly logger: LoggerService,
  ) {}

  @Post(API_CACHE_POPULATE_PATH)
  @UseGuards(JwtAuthGuard)
  async populateCache() {
    this.logger.log(
      "Sending command to middleware to populate cache",
      "CacheController",
    );
    try {
      const result = await firstValueFrom(
        this.middlewareClient.send(CACHE_POPULATE_ALL_CACHES_CMD, {}),
      );
      this.logger.log(
        "Cache population command sent to middleware successfully",
        "CacheController",
        { result },
      );
      return {
        message: "Cache population command sent to middleware successfully.",
        middlewareResponse: result,
      };
    } catch (error) {
      this.logger.error(
        "Failed to send cache population command to middleware:",
        error.stack,
        "CacheController",
        { error: error.message },
      );
      throw new InternalServerErrorException("Failed to send cache population command to middleware");
    }
  }
}
