import { Request, Response, NextFunction } from 'express';
import { BarbershopService, CreateBarbershopDto, UpdateBarbershopDto } from '../services/BarbershopService';
import { AuthenticatedRequest } from '../middleware/auth';

const barbershopService = new BarbershopService();

export class BarbershopController {
  async getAllBarbershops(req: Request, res: Response, next: NextFunction) {
    try {
      const { search } = req.query;
      
      let barbershops;
      if (search && typeof search === 'string') {
        barbershops = await barbershopService.searchBarbershops(search);
      } else {
        barbershops = await barbershopService.findAll();
      }
      
      res.json({
        success: true,
        data: barbershops
      });
    } catch (error) {
      next(error);
    }
  }

  async getBarbershopById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Valid barbershop ID is required'
        });
      }

      const barbershop = await barbershopService.findById(id);
      
      if (!barbershop) {
        return res.status(404).json({
          success: false,
          error: 'Barbershop not found'
        });
      }
      
      res.json({
        success: true,
        data: barbershop
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserBarbershops(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const barbershops = await barbershopService.findByUserId(userId);
      
      res.json({
        success: true,
        data: barbershops
      });
    } catch (error) {
      next(error);
    }
  }

  async createBarbershop(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const barbershopData: CreateBarbershopDto = req.body;

      if (!barbershopData.name || !barbershopData.address) {
        return res.status(400).json({
          success: false,
          error: 'Name and address are required'
        });
      }

      if (barbershopData.amenityIds && !Array.isArray(barbershopData.amenityIds)) {
        return res.status(400).json({
          success: false,
          error: 'amenityIds must be an array'
        });
      }

      if (barbershopData.openingHours && !Array.isArray(barbershopData.openingHours)) {
        return res.status(400).json({
          success: false,
          error: 'openingHours must be an array'
        });
      }

      const barbershop = await barbershopService.create(barbershopData, userId);
      
      res.status(201).json({
        success: true,
        data: barbershop,
        message: 'Barbershop created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async updateBarbershop(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const updates: UpdateBarbershopDto = req.body;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Valid barbershop ID is required'
        });
      }

      if (updates.amenityIds && !Array.isArray(updates.amenityIds)) {
        return res.status(400).json({
          success: false,
          error: 'amenityIds must be an array'
        });
      }

      if (updates.openingHours && !Array.isArray(updates.openingHours)) {
        return res.status(400).json({
          success: false,
          error: 'openingHours must be an array'
        });
      }

      const barbershop = await barbershopService.update(id, updates, userId);
      
      res.json({
        success: true,
        data: barbershop,
        message: 'Barbershop updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteBarbershop(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Valid barbershop ID is required'
        });
      }

      await barbershopService.delete(id, userId);
      
      res.status(200).json({
        success: true,
        message: 'Barbershop deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getBarbershopAmenities(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Valid barbershop ID is required'
        });
      }

      const barbershop = await barbershopService.findById(id);
      
      if (!barbershop) {
        return res.status(404).json({
          success: false,
          error: 'Barbershop not found'
        });
      }
      
      res.json({
        success: true,
        data: barbershop.amenities
      });
    } catch (error) {
      next(error);
    }
  }

  async addAmenities(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { amenityIds } = req.body;
      const userId = req.user!.id;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Valid barbershop ID is required'
        });
      }

      if (!amenityIds || !Array.isArray(amenityIds) || amenityIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'amenityIds array is required and cannot be empty'
        });
      }

      const barbershop = await barbershopService.addAmenities(id, amenityIds, userId);
      
      res.json({
        success: true,
        data: barbershop,
        message: 'Amenities added successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async removeAmenity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id, amenityId } = req.params;
      const userId = req.user!.id;

      if (!id || typeof id !== 'string' || !amenityId || typeof amenityId !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Valid barbershop ID and amenity ID are required'
        });
      }

      const barbershop = await barbershopService.removeAmenity(id, amenityId, userId);
      
      res.json({
        success: true,
        data: barbershop,
        message: 'Amenity removed successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

export const barbershopController = new BarbershopController();