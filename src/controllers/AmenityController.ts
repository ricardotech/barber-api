import { Request, Response, NextFunction } from 'express';
import { AmenityService, CreateAmenityDto, UpdateAmenityDto } from '../services/AmenityService';

const amenityService = new AmenityService();

export class AmenityController {
  async getAllAmenities(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, popular, limit } = req.query;
      
      let amenities;
      
      if (popular === 'true') {
        const limitNum = limit ? parseInt(limit as string) : 10;
        amenities = await amenityService.getPopularAmenities(limitNum);
      } else if (search && typeof search === 'string') {
        amenities = await amenityService.searchAmenities(search);
      } else {
        amenities = await amenityService.findAll();
      }
      
      res.json({
        success: true,
        data: amenities
      });
    } catch (error) {
      next(error);
    }
  }

  async getAmenityById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Valid amenity ID is required'
        });
      }

      const amenity = await amenityService.findById(id);
      
      if (!amenity) {
        return res.status(404).json({
          success: false,
          error: 'Amenity not found'
        });
      }
      
      res.json({
        success: true,
        data: amenity
      });
    } catch (error) {
      next(error);
    }
  }

  async createAmenity(req: Request, res: Response, next: NextFunction) {
    try {
      const amenityData: CreateAmenityDto = req.body;

      if (!amenityData.name || !amenityData.icon) {
        return res.status(400).json({
          success: false,
          error: 'Name and icon are required'
        });
      }

      if (typeof amenityData.name !== 'string' || typeof amenityData.icon !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Name and icon must be strings'
        });
      }

      if (amenityData.name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Name cannot be empty'
        });
      }

      const amenity = await amenityService.create({
        name: amenityData.name.trim(),
        icon: amenityData.icon.trim()
      });
      
      res.status(201).json({
        success: true,
        data: amenity,
        message: 'Amenity created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAmenity(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updates: UpdateAmenityDto = req.body;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Valid amenity ID is required'
        });
      }

      if (updates.name !== undefined) {
        if (typeof updates.name !== 'string' || updates.name.trim().length === 0) {
          return res.status(400).json({
            success: false,
            error: 'Name must be a non-empty string'
          });
        }
        updates.name = updates.name.trim();
      }

      if (updates.icon !== undefined) {
        if (typeof updates.icon !== 'string') {
          return res.status(400).json({
            success: false,
            error: 'Icon must be a string'
          });
        }
        updates.icon = updates.icon.trim();
      }

      const amenity = await amenityService.update(id, updates);
      
      res.json({
        success: true,
        data: amenity,
        message: 'Amenity updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAmenity(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Valid amenity ID is required'
        });
      }

      await amenityService.delete(id);
      
      res.status(200).json({
        success: true,
        message: 'Amenity deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getAmenitiesByBarbershops(req: Request, res: Response, next: NextFunction) {
    try {
      const { barbershopIds } = req.body;

      if (!barbershopIds || !Array.isArray(barbershopIds) || barbershopIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'barbershopIds array is required and cannot be empty'
        });
      }

      if (!barbershopIds.every(id => typeof id === 'string')) {
        return res.status(400).json({
          success: false,
          error: 'All barbershop IDs must be strings'
        });
      }

      const amenitiesByBarbershop = await amenityService.getBarbershopAmenities(barbershopIds);
      
      res.json({
        success: true,
        data: amenitiesByBarbershop
      });
    } catch (error) {
      next(error);
    }
  }
}

export const amenityController = new AmenityController();