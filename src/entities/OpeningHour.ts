import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Barbershop } from './Barbershop';

@Entity('opening_hours')
export class OpeningHour {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20 })
  day: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  openTime: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  closeTime: string;

  @Column({ type: 'boolean', default: false })
  isClosed: boolean;

  @ManyToOne(() => Barbershop, barbershop => barbershop.openingHours)
  @JoinColumn({ name: 'barbershop_id' })
  barbershop: Barbershop;

  @Column({ name: 'barbershop_id' })
  barbershopId: string;
}