import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Barbershop } from './Barbershop';

@Entity('amenities')
export class Amenity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  icon: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ManyToMany(() => Barbershop, barbershop => barbershop.amenities)
  barbershops: Barbershop[];
}