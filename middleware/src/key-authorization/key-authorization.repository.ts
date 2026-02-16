import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { KeyAuthorization } from "../db/entities";
import { Repository } from "typeorm";

@Injectable()
export class KeyAuthorizationRepository {
  constructor(
    @InjectRepository(KeyAuthorization)
    private readonly keyAuthRepository: Repository<KeyAuthorization>,
  ) {}
  async create(
    partialKeyAuthorization: Partial<KeyAuthorization>,
  ): Promise<KeyAuthorization> {
    const keyAuthorization = this.keyAuthRepository.create(partialKeyAuthorization);
    return await this.keyAuthRepository.save(keyAuthorization);
  }
  async findOneBy(
    criteria: Partial<KeyAuthorization>,
  ): Promise<KeyAuthorization | null> {
    return await this.keyAuthRepository.findOne({ where: criteria });
  }

  async findAll(): Promise<KeyAuthorization[]> {
    return this.keyAuthRepository.find();
  }
}
