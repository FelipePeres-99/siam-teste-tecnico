import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Reader } from "../db/entities";
import { ReaderRepository } from "./reader.repository";
import { LoggerService } from "@siam/types";
import { DEVICE_GET_BASIC_CONFIG_CMD, READER_CHECK_CONFIGURATION_CMD } from "src/constants/events.constants";

@Injectable()
export class ReaderService {
  constructor(
    @Inject(ReaderRepository)
    private readonly readerRepository: ReaderRepository,
    private readonly eventEmitter: EventEmitter2,
     private readonly logger: LoggerService
  ) {}
  async findAll() {
    return await this.readerRepository.findAll();
  }

  async findBy(criteria: Partial<Reader>): Promise<Reader[]> {
    return await this.readerRepository.findBy(criteria);
  }

  async findOneBy(criteria: Partial<Reader>): Promise<Reader | null> {
    return await this.readerRepository.findOneBy(criteria);
  }

  async findOneByIdWithDevice(id: number): Promise<Reader | null> {
    const reader = await this.readerRepository.findOneByIdWithDevice(id);
    if (!reader) {
      throw new NotFoundException(`Reader with ID ${id} not found`);
    }
    return reader;
  }

  @OnEvent(READER_CHECK_CONFIGURATION_CMD)
  async handleCheckConfiguration(payload: {
    readerId: number;
  }): Promise<boolean> {
    this.logger.log(
      `ReaderService: Verificando configuração do reader ${payload.readerId}`,
    );

    const reader = await this.findOneBy({ deviceId: payload.readerId });
    const isConfigured = !!reader;

    this.logger.log(`ReaderService: Reader encontrado? ${isConfigured}`);

    return isConfigured;
  }
  // Essa função foi criada para exemplificar o uso do EventEmitter e como evitar o acoplamento direto entre serviços, evitando assim a necessidade de fowardref.
  async getDeviceBasicConfig(deviceId: number) {
    try {
      const configs = await this.eventEmitter.emitAsync(
        DEVICE_GET_BASIC_CONFIG_CMD,
        { deviceId },
      );
      return configs && configs[0];
    } catch (error) {
      this.logger.error("Erro ao obter config do device:", error);
      return null;
    }
  }
}
