import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { Key } from "../db/entities";
import { KeyRepository } from "./key.repository";
import { LoggerService } from "@siam/types";
import { EVENT_BUS_SERVICE_TOKEN } from "../constants/tokens.constants";
import { KEY_CREATED_EVENT } from "src/constants/events.constants";

@Injectable()
export class KeyService {
  constructor(
    @Inject(KeyRepository)
    private readonly keyRepository: KeyRepository,
    @Inject(EVENT_BUS_SERVICE_TOKEN) private readonly eventBusService: ClientProxy,
    private readonly logger: LoggerService,
  ) {}
  async findAll() {
    return await this.keyRepository.findAll();
  }
  async create(partialKey: Partial<Key>): Promise<Key> {
    const key = await this.keyRepository.create(partialKey);
    this.eventBusService.emit(KEY_CREATED_EVENT, key);
    this.logger.log(`Created key ${key.keyId} and emitted event`, 'KeyService');
    return key;
  }

  async findOneBy(criteria: Partial<Key>): Promise<Key | null> {
    return await this.keyRepository.findOneBy(criteria);
  }

  async findBy(criteria: Partial<Key>): Promise<Key[]> {
    return await this.keyRepository.findBy(criteria);
  }
}
