import { Inject, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { KeyAuthorization } from "../db/entities";
import { KeyAuthorizationRepository } from "./key-authorization.repository";
import { LoggerService } from "@siam/types";
import { KEY_AUTHORIZATION_CREATED_EVENT } from "src/constants/events.constants";

@Injectable()
export class KeyAuthorizationService {
  constructor(
    @Inject(KeyAuthorizationRepository)
    private readonly keyAuthorizationRepository: KeyAuthorizationRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: LoggerService,
  ) {}
  async findAll() {
    return await this.keyAuthorizationRepository.findAll();
  }

  async create(
    partialKeyAuthorization: Partial<KeyAuthorization>,
  ): Promise<KeyAuthorization> {
    const keyAuthorization = await this.keyAuthorizationRepository.create(
      partialKeyAuthorization,
    );
    this.eventEmitter.emit(KEY_AUTHORIZATION_CREATED_EVENT, keyAuthorization);
    this.logger.log(`Created key authorization and emitted event`, 'KeyAuthorizationService');
    return keyAuthorization;
  }
  async findOneBy(
    criteria: Partial<KeyAuthorization>,
  ): Promise<KeyAuthorization | null> {
    return await this.keyAuthorizationRepository.findOneBy(criteria);
  }
}
