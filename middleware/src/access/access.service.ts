import { Injectable, Inject, NotFoundException, BadRequestException } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { ReaderService } from "../reader/reader.service";
import { DeviceService } from "../device/device.service";
import { KeyService } from "../key/key.service";
import { KeyAuthorizationService } from "../key-authorization/key-authorization.service";
import { LoggerService } from '@siam/types'
import { DEVICE_EXECUTE_CMD } from '@siam/common'
import { DEVICE_COMM_SERVICE_TOKEN } from "src/constants/rabbitmq.constants";
import { DEVICE_COMMAND_OPEN_DOOR } from "src/constants/events.constants";

@Injectable()
export class AccessService {
  constructor(
    @Inject(KeyService) private readonly keyService: KeyService,
    @Inject(KeyAuthorizationService)
    private readonly keyAuthorizationService: KeyAuthorizationService,
    @Inject(ReaderService) private readonly readerService: ReaderService,
    @Inject(DeviceService) private readonly deviceService: DeviceService,
    @Inject(DEVICE_COMM_SERVICE_TOKEN) private readonly client: ClientProxy,
    private readonly logger: LoggerService,
  ) {}

  async grantAccess(userId: number, doorId: number) {
    this.logger.log(`Granting access for user ${userId} to door ${doorId}`, 'AccessService');
    // 1. Find Readers for Door
    const readers = await this.readerService.findBy({ doorDeviceId: doorId });
    if (readers.length === 0) {
      this.logger.warn(`No readers found for door ${doorId}`, 'AccessService');
      throw new NotFoundException(`No readers found for door ${doorId}`);
    }

    // Start demo: Avoiding circular reference (deviceService <> readerService)
    // Instead of direct injection, we use EventEmitter for asynchronous communication
    const isReaderConfigured =
      await this.deviceService.validateReaderIsConfigured(readers[0].deviceId);
    if (!isReaderConfigured) {
      this.logger.warn(`Reader ${readers[0].deviceId} is not properly configured`, 'AccessService');  
      throw new BadRequestException(`Reader ${readers[0].deviceId} is not properly configured`);      
    }
    // Get device config via readerService (without creating circular dependency)
    const deviceConfig = await this.readerService.getDeviceBasicConfig(doorId);
    this.logger.debug(`Device config retrieved`, 'AccessService', { deviceConfig: JSON.stringify(deviceConfig) });
    // End demo

    // 2. Find Key (Simplified: Get first key or create dummy)
    let key = await this.keyService.findOneBy({ userId });
    if (!key) {
      this.logger.log(`Creating virtual key for user ${userId}`, 'AccessService');
      key = await this.keyService.create({ userId, keyType: "virtual" });
    }

    // 3. Create Authorization
    for (const reader of readers) {
      await this.keyAuthorizationService.create({
        keyId: key.keyId,
        readerId: reader.deviceId,
        allowed: true,
      });
    }

    return { status: "Success", message: "Access granted" };
  }

  async triggerDoorOpen(doorId: number) {
    // 1. Find a reader for the door to get the communication URL
    const readers = await this.readerService.findBy({ doorDeviceId: doorId });
    if (!readers || readers.length === 0) {
      throw new NotFoundException(`No readers found for door ${doorId}`);
    }

    const reader = readers[0]; // Use the first reader
    const readerDevice = await this.deviceService.findOneBy({
      deviceId: reader.deviceId,
    });

    const targetUrl = readerDevice?.url;
    if (!targetUrl) {
      throw new NotFoundException(`No communication URL found for door ${doorId}`);
    }

    // 2. Send to Device-Comm
    const payload = { url: targetUrl, command: DEVICE_COMMAND_OPEN_DOOR, doorId };
    this.logger.log(
      `Middleware: Sending command to Device-Comm: ${JSON.stringify(payload)}`,
      'AccessService'
    );
    this.client.emit(DEVICE_EXECUTE_CMD, payload);

    return { status: "Success", message: "Open command sent" };
  }

  // ✨ NOVA FUNCIONALIDADE 3.1 - Buscar acessos de usuário em prédio específico (MOCK)
  async getUserAccessesInBuilding(userId: number, buildingId: number) {
    this.logger.log(`Getting access events for user ${userId} in building ${buildingId}`, 'AccessService');
    
    // Mock data para teste
    const mockAccesses = [
      {
        eventId: 1,
        occurredAt: new Date('2026-02-15T10:30:00Z'),
        userId: userId,
        readerId: 101,
        deviceId: 1,
        allowed: true,
        reason: 'Valid access'
      },
      {
        eventId: 2,
        occurredAt: new Date('2026-02-15T14:15:00Z'),
        userId: userId,
        readerId: 102,
        deviceId: 2,
        allowed: true,
        reason: 'Valid access'
      }
    ];
    
    this.logger.log(`Found ${mockAccesses.length} access events for user ${userId} in building ${buildingId}`, 'AccessService');
    
    return {
      userId,
      buildingId,
      totalAccesses: mockAccesses.length,
      accesses: mockAccesses
    };
  }

  // ✨ NOVA FUNCIONALIDADE 3.2 - Abrir todas as portas de um prédio (MOCK)
  async openAllDoorsInBuilding(buildingId: number) {
    this.logger.log(`Opening all doors in building ${buildingId}`, 'AccessService');
    
    // Mock doors para teste
    const mockDoors = [
      { deviceId: 1, url: 'http://127.0.0.1:8101' },
      { deviceId: 2, url: 'http://127.0.0.1:8101' },
      { deviceId: 3, url: 'http://127.0.0.1:8101' }
    ];

    this.logger.log(`Found ${mockDoors.length} doors in building ${buildingId}`, 'AccessService');

    // 2. Enviar comando para abrir cada porta
    const openCommands = [];
    for (const door of mockDoors) {
      const payload = { 
        url: door.url, 
        command: DEVICE_COMMAND_OPEN_DOOR, 
        doorId: door.deviceId,
        buildingId 
      };
      
      this.logger.log(`Sending open command for door ${door.deviceId}`, 'AccessService');
      this.client.emit(DEVICE_EXECUTE_CMD, payload);
      
      openCommands.push({
        doorId: door.deviceId,
        status: 'command_sent'
      });
    }

    return {
      buildingId,
      totalDoors: mockDoors.length,
      commandsSent: openCommands.filter(cmd => cmd.status === 'command_sent').length,
      results: openCommands
    };
  }
}