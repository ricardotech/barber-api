import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { User } from './User';
import { Amenity } from './Amenity';
import { OpeningHour } from './OpeningHour';

@Entity('barbershops')
export class Barbershop {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logoUrl: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  coverImageUrl: string;

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 0.0 })
  rating: number;

  @Column({ type: 'text', nullable: true })
  about: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.barbershops)
  @JoinColumn({ name: 'created_by' })
  owner: User;

  @Column({ name: 'created_by' })
  createdBy: string;

  @ManyToMany(() => Amenity, amenity => amenity.barbershops)
  @JoinTable({
    name: 'barbershop_amenities',
    joinColumn: { name: 'barbershop_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'amenity_id', referencedColumnName: 'id' }
  })
  amenities: Amenity[];

  @OneToMany(() => OpeningHour, openingHour => openingHour.barbershop, { cascade: true })
  openingHours: OpeningHour[];
}