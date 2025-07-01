import { Request, Response, NextFunction } from 'express';
import { BarbershopService, CreateBarbershopDto, UpdateBarbershopDto } from '../services/BarbershopService';
import { AuthenticatedRequest } from '../middleware/auth';
import { fileStorageService } from '../services/FileStorageService';
import path from 'path';

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

  async uploadBarbershopImages(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const files = req.files as Express.Multer.File[];

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Valid barbershop ID is required'
        });
      }

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'At least one image file is required'
        });
      }

      // Validate all files
      for (const file of files) {
        const validation = fileStorageService.validateImageFile(file);
        if (!validation.isValid) {
          return res.status(400).json({
            success: false,
            error: validation.error
          });
        }
      }

      // Check if barbershop exists and user has permission
      const barbershop = await barbershopService.findById(id);
      if (!barbershop) {
        return res.status(404).json({
          success: false,
          error: 'Barbershop not found'
        });
      }

      if (barbershop.owner.id !== userId && req.user!.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Access denied. You can only upload images to your own barbershops.'
        });
      }

      // Process and save images
      const imageUrls: Array<{url: string, thumbnail: string, originalName: string}> = [];
      const uploadDir = path.join(__dirname, '../../uploads/barbershops');

      for (const file of files) {
        try {
          // Generate processed filename
          const processedFilename = `processed_${file.filename}`;
          const processedPath = path.join(uploadDir, processedFilename);
          
          // Process the image
          await fileStorageService.processImage(
            file.path,
            processedPath,
            1200, // width
            800,  // height
            85    // quality
          );

          // Generate thumbnail
          const thumbnailFilename = `thumb_${file.filename}`;
          const thumbnailPath = path.join(uploadDir, thumbnailFilename);
          await fileStorageService.generateThumbnail(file.path, thumbnailPath);

          // Get URL for processed image
          const imageUrl = fileStorageService.getFileUrl(processedFilename, 'barbershops');
          const thumbnailUrl = fileStorageService.getFileUrl(thumbnailFilename, 'barbershops');

          imageUrls.push({
            url: imageUrl,
            thumbnail: thumbnailUrl,
            originalName: file.originalname
          });

        } catch (processError) {
          console.error('Error processing image:', processError);
          // Clean up file if processing failed
          fileStorageService.deleteFile(file.path);
        }
      }

      // Update barbershop with new images
      const currentImages = barbershop.images || [];
      const updatedImages = [...currentImages, ...imageUrls.map(img => img.url)];
      
      await barbershopService.update(id, { images: updatedImages }, userId);

      res.json({
        success: true,
        data: {
          uploadedImages: imageUrls,
          totalImages: updatedImages.length
        },
        message: `${imageUrls.length} image(s) uploaded successfully`
      });

    } catch (error) {
      next(error);
    }
  }

  async deleteBarbershopImage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { imageUrl } = req.body;
      const userId = req.user!.id;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Valid barbershop ID is required'
        });
      }

      if (!imageUrl || typeof imageUrl !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Image URL is required'
        });
      }

      // Check if barbershop exists and user has permission
      const barbershop = await barbershopService.findById(id);
      if (!barbershop) {
        return res.status(404).json({
          success: false,
          error: 'Barbershop not found'
        });
      }

      if (barbershop.owner.id !== userId && req.user!.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Access denied. You can only delete images from your own barbershops.'
        });
      }

      // Remove image from barbershop
      const currentImages = barbershop.images || [];
      const updatedImages = currentImages.filter((img: string) => img !== imageUrl);

      await barbershopService.update(id, { images: updatedImages }, userId);

      // Delete physical file
      const filename = imageUrl.split('/').pop();
      if (filename) {
        const filePath = path.join(__dirname, '../../uploads/barbershops', filename);
        const thumbnailPath = path.join(__dirname, '../../uploads/barbershops', `thumb_${filename}`);
        
        fileStorageService.deleteFile(filePath);
        fileStorageService.deleteFile(thumbnailPath);
      }

      res.json({
        success: true,
        data: {
          removedImage: imageUrl,
          remainingImages: updatedImages
        },
        message: 'Image deleted successfully'
      });

    } catch (error) {
      next(error);
    }
  }
}

export const barbershopController = new BarbershopController();