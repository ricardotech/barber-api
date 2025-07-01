import { IsString, IsOptional, IsNotEmpty, Length, IsArray, IsUUID, ArrayMinSize } from 'class-validator';

export class CreateAmenityDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  icon: string;
}

export class UpdateAmenityDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  icon?: string;
}

export class AmenityQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  popular?: 'true' | 'false';

  @IsOptional()
  @IsString()
  limit?: string;
}

export class BarbershopAmenitiesDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID(4, { each: true })
  barbershopIds: string[];
}

export interface AmenityResponse {
  id: string;
  name: string;
  icon: string;
}

export interface PopularAmenityResponse extends AmenityResponse {
  usageCount?: number;
}