import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Amenity } from '../entities/Amenity';

export interface CreateAmenityDto {
  name: string;
  icon: string;
}

export interface UpdateAmenityDto {
  name?: string;
  icon?: string;
}

export class AmenityService {
  private amenityRepository: Repository<Amenity>;

  constructor() {
    this.amenityRepository = AppDataSource.getRepository(Amenity);
  }

  async findAll(): Promise<Amenity[]> {
    return await this.amenityRepository.find({
      order: { name: 'ASC' }
    });
  }

  async findById(id: string): Promise<Amenity | null> {
    return await this.amenityRepository.findOne({
      where: { id }
    });
  }

  async findByIds(ids: string[]): Promise<Amenity[]> {
    if (!ids || ids.length === 0) {
      return [];
    }
    return await this.amenityRepository.findByIds(ids);
  }

  async findByName(name: string): Promise<Amenity | null> {
    return await this.amenityRepository.findOne({
      where: { name }
    });
  }

  async create(data: CreateAmenityDto): Promise<Amenity> {
    const existingAmenity = await this.findByName(data.name);
    if (existingAmenity) {
      throw new Error('Amenity with this name already exists');
    }

    const amenity = this.amenityRepository.create({
      name: data.name,
      icon: data.icon
    });

    return await this.amenityRepository.save(amenity);
  }

  async update(id: string, updates: UpdateAmenityDto): Promise<Amenity> {
    const amenity = await this.findById(id);
    
    if (!amenity) {
      throw new Error('Amenity not found');
    }

    if (updates.name && updates.name !== amenity.name) {
      const existingAmenity = await this.findByName(updates.name);
      if (existingAmenity && existingAmenity.id !== id) {
        throw new Error('Amenity with this name already exists');
      }
    }

    Object.assign(amenity, {
      name: updates.name ?? amenity.name,
      icon: updates.icon ?? amenity.icon
    });

    return await this.amenityRepository.save(amenity);
  }

  async delete(id: string): Promise<void> {
    const amenity = await this.findById(id);
    
    if (!amenity) {
      throw new Error('Amenity not found');
    }

    const barbershopCount = await this.amenityRepository
      .createQueryBuilder('amenity')
      .leftJoin('amenity.barbershops', 'barbershop')
      .where('amenity.id = :id', { id })
      .getCount();

    if (barbershopCount > 0) {
      throw new Error('Cannot delete amenity that is associated with barbershops');
    }

    await this.amenityRepository.delete(id);
  }

  async searchAmenities(query: string): Promise<Amenity[]> {
    return await this.amenityRepository
      .createQueryBuilder('amenity')
      .where('amenity.name ILIKE :query', { query: `%${query}%` })
      .orderBy('amenity.name', 'ASC')
      .getMany();
  }

  async getPopularAmenities(limit: number = 10): Promise<Amenity[]> {
    return await this.amenityRepository
      .createQueryBuilder('amenity')
      .leftJoin('amenity.barbershops', 'barbershop')
      .addSelect('COUNT(barbershop.id) as usage_count')
      .groupBy('amenity.id')
      .orderBy('usage_count', 'DESC')
      .limit(limit)
      .getMany();
  }

  async getBarbershopAmenities(barbershopIds: string[]): Promise<{ [barbershopId: string]: Amenity[] }> {
    const results = await this.amenityRepository
      .createQueryBuilder('amenity')
      .innerJoin('amenity.barbershops', 'barbershop')
      .where('barbershop.id IN (:...barbershopIds)', { barbershopIds })
      .select(['amenity', 'barbershop.id'])
      .getMany();

    const amenitiesByBarbershop: { [barbershopId: string]: Amenity[] } = {};
    
    results.forEach(amenity => {
      amenity.barbershops?.forEach(barbershop => {
        if (!amenitiesByBarbershop[barbershop.id]) {
          amenitiesByBarbershop[barbershop.id] = [];
        }
        amenitiesByBarbershop[barbershop.id].push({
          id: amenity.id,
          name: amenity.name,
          icon: amenity.icon,
          barbershops: []
        });
      });
    });

    return amenitiesByBarbershop;
  }
}