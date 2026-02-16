import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Key } from "../db/entities";
import { Repository } from "typeorm";

@Injectable()
export class KeyRepository {
  constructor(
    @InjectRepository(Key)
    private readonly keyRepository: Repository<Key>,
  ) {}

  async create(partialKey: Partial<Key>): Promise<Key> {
    const key = this.keyRepository.create(partialKey);
    return await this.keyRepository.save(key);
  }

  async findOneBy(criteria: Partial<Key>): Promise<Key | null> {
    return await this.keyRepository.findOne({ where: criteria });
  }

  async findBy(criteria: Partial<Key>): Promise<Key[]> {
    return await this.keyRepository.findBy(criteria);
  }

  async findAll(): Promise<Key[]> {
    return this.keyRepository.find();
  }
}
