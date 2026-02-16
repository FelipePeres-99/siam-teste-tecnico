import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Key, Reader, Device, AccessEvent } from '../db/entities';

@Injectable()
export class AccessRepository {
  constructor(
    @InjectRepository(Key) private readonly keyRepo: Repository<Key>,
    @InjectRepository(Reader) private readonly readerRepo: Repository<Reader>,
    @InjectRepository(Device) private readonly deviceRepo: Repository<Device>,
    @InjectRepository(AccessEvent) private readonly accessEventRepo: Repository<AccessEvent>,
  ) {}

  async findKeyByUserId(userId: number): Promise<Key | null> {
    return await this.keyRepo.findOneBy({ userId });
  }

  async findAllKeysByUserId(userId: number): Promise<Key[]> {
    return await this.keyRepo.findBy({ userId });
  }

  async createKey(partialKey: Partial<Key>): Promise<Key> {
    const key = this.keyRepo.create(partialKey);
    return await this.keyRepo.save(key);
  }

  async findReadersByDoorId(doorId: number): Promise<Reader[]> {
    return await this.readerRepo.findBy({ doorDeviceId: doorId });
  }

  async findDeviceById(deviceId: number): Promise<Device | null> {
    return await this.deviceRepo.findOneBy({ deviceId });
  }

  async findDeviceByIdAndType(deviceId: number): Promise<Device | null> {
    return await this.deviceRepo.findOneBy({ deviceId });
  }

  // ✨ NOVA FUNCIONALIDADE 3.1 - Buscar acessos de usuário em prédio específico
  async findUserAccessesInBuilding(userId: number, buildingId: number): Promise<AccessEvent[]> {
    return await this.accessEventRepo
      .createQueryBuilder('ae')
      .innerJoin('user', 'u', 'ae.user_id = u.user_id')
      .where('u.user_id = :userId', { userId })
      .andWhere('u.building_id = :buildingId', { buildingId })
      .orderBy('ae.occurred_at', 'DESC')
      .getMany();
  }

  // ✨ NOVA FUNCIONALIDADE 3.2 - Buscar todas as portas de um prédio
  async findAllDoorsInBuilding(buildingId: number): Promise<Device[]> {
    return await this.deviceRepo
      .createQueryBuilder('d')
      .innerJoin('door', 'dr', 'd.device_id = dr.device_id')
      .where('d.building_id = :buildingId', { buildingId })
      .andWhere('d.device_type = :deviceType', { deviceType: 'door' })
      .getMany();
  }
}