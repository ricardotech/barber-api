import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Barbershop } from '../entities/Barbershop';
import { Amenity } from '../entities/Amenity';
import { OpeningHour } from '../entities/OpeningHour';
import { User } from '../entities/User';

export interface CreateBarbershopDto {
  name: string;
  address: string;
  phone?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  about?: string;
  amenityIds?: string[];
  openingHours?: {
    day: string;
    openTime?: string;
    closeTime?: string;
    isClosed: boolean;
  }[];
}

export interface UpdateBarbershopDto {
  name?: string;
  address?: string;
  phone?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  about?: string;
  amenityIds?: string[];
  openingHours?: {
    day: string;
    openTime?: string;
    closeTime?: string;
    isClosed: boolean;
  }[];
}

export class BarbershopService {
  private barbershopRepository: Repository<Barbershop>;
  private amenityRepository: Repository<Amenity>;
  private openingHourRepository: Repository<OpeningHour>;
  private userRepository: Repository<User>;

  constructor() {
    this.barbershopRepository = AppDataSource.getRepository(Barbershop);
    this.amenityRepository = AppDataSource.getRepository(Amenity);
    this.openingHourRepository = AppDataSource.getRepository(OpeningHour);
    this.userRepository = AppDataSource.getRepository(User);
  }

  async findAll(): Promise<Barbershop[]> {
    return await this.barbershopRepository.find({
      relations: ['amenities', 'openingHours', 'owner'],
      order: { name: 'ASC' },
      select: {
        owner: {
          id: true,
          fullName: true,
          email: true
        }
      }
    });
  }

  async findById(id: string): Promise<Barbershop | null> {
    return await this.barbershopRepository.findOne({
      where: { id },
      relations: ['amenities', 'openingHours', 'owner'],
      select: {
        owner: {
          id: true,
          fullName: true,
          email: true
        }
      }
    });
  }

  async findByUserId(userId: string): Promise<Barbershop[]> {
    return await this.barbershopRepository.find({
      where: { createdBy: userId },
      relations: ['amenities', 'openingHours'],
      order: { name: 'ASC' }
    });
  }

  async create(data: CreateBarbershopDto, userId: string): Promise<Barbershop> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    if (user.role !== 'barber' && user.role !== 'admin') {
      throw new Error('Only barbers can create barbershops');
    }

    const barbershop = this.barbershopRepository.create({
      name: data.name,
      address: data.address,
      phone: data.phone,
      logoUrl: data.logoUrl,
      coverImageUrl: data.coverImageUrl,
      about: data.about,
      createdBy: userId,
      owner: user
    });

    if (data.amenityIds && data.amenityIds.length > 0) {
      const amenities = await this.amenityRepository.findByIds(data.amenityIds);
      barbershop.amenities = amenities;
    }

    const savedBarbershop = await this.barbershopRepository.save(barbershop);

    if (data.openingHours && data.openingHours.length > 0) {
      const openingHours = data.openingHours.map(hour => {
        const openingHour = this.openingHourRepository.create({
          day: hour.day,
          openTime: hour.openTime,
          closeTime: hour.closeTime,
          isClosed: hour.isClosed,
          barbershopId: savedBarbershop.id,
          barbershop: savedBarbershop
        });
        return openingHour;
      });

      await this.openingHourRepository.save(openingHours);
      savedBarbershop.openingHours = openingHours;
    }

    return await this.findById(savedBarbershop.id) as Barbershop;
  }

  async update(id: string, updates: UpdateBarbershopDto, userId: string): Promise<Barbershop> {
    const barbershop = await this.findById(id);
    
    if (!barbershop) {
      throw new Error('Barbershop not found');
    }
    
    if (barbershop.createdBy !== userId) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user || user.role !== 'admin') {
        throw new Error('Unauthorized to update this barbershop');
      }
    }

    Object.assign(barbershop, {
      name: updates.name ?? barbershop.name,
      address: updates.address ?? barbershop.address,
      phone: updates.phone ?? barbershop.phone,
      logoUrl: updates.logoUrl ?? barbershop.logoUrl,
      coverImageUrl: updates.coverImageUrl ?? barbershop.coverImageUrl,
      about: updates.about ?? barbershop.about
    });

    if (updates.amenityIds !== undefined) {
      if (updates.amenityIds.length > 0) {
        const amenities = await this.amenityRepository.findByIds(updates.amenityIds);
        barbershop.amenities = amenities;
      } else {
        barbershop.amenities = [];
      }
    }

    await this.barbershopRepository.save(barbershop);

    if (updates.openingHours !== undefined) {
      await this.openingHourRepository.delete({ barbershopId: id });
      
      if (updates.openingHours.length > 0) {
        const openingHours = updates.openingHours.map(hour => {
          return this.openingHourRepository.create({
            day: hour.day,
            openTime: hour.openTime,
            closeTime: hour.closeTime,
            isClosed: hour.isClosed,
            barbershopId: id,
            barbershop: barbershop
          });
        });

        await this.openingHourRepository.save(openingHours);
      }
    }

    return await this.findById(id) as Barbershop;
  }

  async delete(id: string, userId: string): Promise<void> {
    const barbershop = await this.findById(id);
    
    if (!barbershop) {
      throw new Error('Barbershop not found');
    }
    
    if (barbershop.createdBy !== userId) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user || user.role !== 'admin') {
        throw new Error('Unauthorized to delete this barbershop');
      }
    }

    await this.openingHourRepository.delete({ barbershopId: id });
    await this.barbershopRepository.delete(id);
  }

  async addAmenities(barbershopId: string, amenityIds: string[], userId: string): Promise<Barbershop> {
    const barbershop = await this.findById(barbershopId);
    
    if (!barbershop) {
      throw new Error('Barbershop not found');
    }
    
    if (barbershop.createdBy !== userId) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user || user.role !== 'admin') {
        throw new Error('Unauthorized to modify this barbershop');
      }
    }

    const amenities = await this.amenityRepository.findByIds(amenityIds);
    const existingAmenityIds = barbershop.amenities.map(a => a.id);
    const newAmenities = amenities.filter(a => !existingAmenityIds.includes(a.id));
    
    barbershop.amenities = [...barbershop.amenities, ...newAmenities];
    await this.barbershopRepository.save(barbershop);

    return await this.findById(barbershopId) as Barbershop;
  }

  async removeAmenity(barbershopId: string, amenityId: string, userId: string): Promise<Barbershop> {
    const barbershop = await this.findById(barbershopId);
    
    if (!barbershop) {
      throw new Error('Barbershop not found');
    }
    
    if (barbershop.createdBy !== userId) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user || user.role !== 'admin') {
        throw new Error('Unauthorized to modify this barbershop');
      }
    }

    barbershop.amenities = barbershop.amenities.filter(amenity => amenity.id !== amenityId);
    await this.barbershopRepository.save(barbershop);

    return await this.findById(barbershopId) as Barbershop;
  }

  async searchBarbershops(query: string): Promise<Barbershop[]> {
    return await this.barbershopRepository
      .createQueryBuilder('barbershop')
      .leftJoinAndSelect('barbershop.amenities', 'amenities')
      .leftJoinAndSelect('barbershop.openingHours', 'openingHours')
      .leftJoinAndSelect('barbershop.owner', 'owner')
      .where('barbershop.name ILIKE :query', { query: `%${query}%` })
      .orWhere('barbershop.address ILIKE :query', { query: `%${query}%` })
      .orWhere('barbershop.about ILIKE :query', { query: `%${query}%` })
      .orderBy('barbershop.name', 'ASC')
      .select([
        'barbershop',
        'amenities',
        'openingHours',
        'owner.id',
        'owner.fullName',
        'owner.email'
      ])
      .getMany();
  }
}