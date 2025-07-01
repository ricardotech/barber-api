import { IsString, IsOptional, IsArray, IsBoolean, IsUUID, IsNotEmpty, Length, IsUrl, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOpeningHourDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  day: string;

  @IsOptional()
  @IsString()
  @Length(4, 10)
  openTime?: string;

  @IsOptional()
  @IsString()
  @Length(4, 10)
  closeTime?: string;

  @IsBoolean()
  isClosed: boolean;
}

export class CreateBarbershopDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  phone?: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsUrl()
  coverImageUrl?: string;

  @IsOptional()
  @IsString()
  about?: string;

  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  amenityIds?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOpeningHourDto)
  openingHours?: CreateOpeningHourDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

export class UpdateBarbershopDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  address?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  phone?: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsUrl()
  coverImageUrl?: string;

  @IsOptional()
  @IsString()
  about?: string;

  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  amenityIds?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOpeningHourDto)
  openingHours?: CreateOpeningHourDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

export class BarbershopAmenityDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(4, { each: true })
  amenityIds: string[];
}

export class BarbershopQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortBy?: 'name' | 'rating' | 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';
}

export interface BarbershopResponse {
  id: string;
  name: string;
  address: string;
  phone?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  rating: number;
  about?: string;
  createdAt: Date;
  updatedAt: Date;
  owner: {
    id: string;
    fullName?: string;
    email: string;
  };
  amenities: AmenityResponse[];
  openingHours: OpeningHourResponse[];
  images?: string[];
}

export interface OpeningHourResponse {
  id: string;
  day: string;
  openTime?: string;
  closeTime?: string;
  isClosed: boolean;
}

export interface AmenityResponse {
  id: string;
  name: string;
  icon: string;
}