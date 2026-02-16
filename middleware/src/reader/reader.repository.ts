import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Device, Reader } from "../db/entities";
import { Repository } from "typeorm";

@Injectable()
export class ReaderRepository {
  constructor(
    @InjectRepository(Reader)
    private readonly readerRepository: Repository<Reader>,
  ) {}

  async findBy(criteria: Partial<Reader>): Promise<Reader[]> {
    return await this.readerRepository.findBy(criteria);
  }

  async findOneBy(criteria: Partial<Reader>): Promise<Reader | null> {
    return await this.readerRepository.findOne({ where: criteria });
  }

  /**
   * Exemplo educativo: Select que retorna duas entities
   */
  async findOneByIdWithDevice(
    readerId: number,
  ): Promise<(Reader & { device: Device }) | null> {
    const query = `
      SELECT 
        r.device_id AS reader_id,
        r.door_device_id AS door_id,
        d.device_id AS device_id,
        d.url AS device_url
      FROM device_comm_example.reader r
      LEFT JOIN device_comm_example.door dd ON dd.device_id = r.door_device_id
      LEFT JOIN device_comm_example.device d ON d.device_id = dd.device_id
      WHERE r.device_id = $1
    `;

    const rawData = await this.readerRepository.query(query, [readerId]);

    if (!rawData.length) return null;

    const row = rawData[0];
    return {
      deviceId: row.reader_id,
      doorDeviceId: row.door_id,
      device: {
        deviceId: row.device_id,
        url: row.device_url,
      } as Device,
    } as Reader & { device: Device };
  }

  async findAll(): Promise<Reader[]> {
    return this.readerRepository.find();
  }
}
