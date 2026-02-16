import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../db/entities';
import { Repository } from 'typeorm';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async deleteAllInBuilding(buildingId: number): Promise<void> {
    await this.userRepository.delete({ buildingId });
  }

  async findAllInBuilding(buildingId: number): Promise<User[]> {
    return this.userRepository.find({ where: { buildingId } });
  }

  async save(user: Partial<User>): Promise<User> {
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }
}
