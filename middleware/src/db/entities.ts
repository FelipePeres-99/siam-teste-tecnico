import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'user', schema: 'device_comm_example' })
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  userId: number;

  @Column({ name: 'building_id' })
  buildingId: number;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ name: 'email', nullable: true })
  email: string;

  @Column({ name: 'password_hash', nullable: true })
  passwordHash: string;
}

@Entity({ name: 'key', schema: 'device_comm_example' })
export class Key {
  @PrimaryGeneratedColumn({ name: 'key_id' })
  keyId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'key_type' })
  keyType: string;
}

@Entity({ name: 'key_authorization', schema: 'device_comm_example' })
export class KeyAuthorization {
  @Column({ name: 'key_id', primary: true })
  keyId: number;

  @Column({ name: 'reader_id', primary: true })
  readerId: number;

  @Column()
  allowed: boolean;
}

@Entity({ name: 'device', schema: 'device_comm_example' })
export class Device {
  @PrimaryGeneratedColumn({ name: 'device_id' })
  deviceId: number;

  @Column({ name: 'building_id' })
  buildingId: number;

  @Column({ name: 'device_type' })
  deviceType: string;

  @Column()
  url: string;
}

@Entity({ name: 'door', schema: 'device_comm_example' })
export class Door {
  @Column({ name: 'device_id', primary: true })
  deviceId: number;
}

@Entity({ name: 'reader', schema: 'device_comm_example' })
export class Reader {
  @Column({ name: 'device_id', primary: true })
  deviceId: number;

  @Column({ name: 'door_device_id' })
  doorDeviceId: number;
}

// ✨ NOVA ENTIDADE PARA ACCESS_EVENT
@Entity({ name: 'access_event', schema: 'device_comm_example' })
export class AccessEvent {
  @PrimaryGeneratedColumn({ name: 'event_id' })
  eventId: number;

  @Column({ name: 'occurred_at' })
  occurredAt: Date;

  @Column({ name: 'reader_id', nullable: true })
  readerId: number;

  @Column({ name: 'device_id', nullable: true })
  deviceId: number;

  @Column({ name: 'key_id', nullable: true })
  keyId: number;

  @Column({ name: 'user_id', nullable: true })
  userId: number;

  @Column({ nullable: true })
  allowed: boolean;

  @Column({ nullable: true })
  reason: string;

  @Column({ name: 'raw_payload', type: 'jsonb', nullable: true })
  rawPayload: any;
}