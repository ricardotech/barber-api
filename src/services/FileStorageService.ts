import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export class FileStorageService {
  private uploadsDir = path.join(__dirname, '../../uploads');

  constructor() {
    this.ensureDirectoriesExist();
  }

  private ensureDirectoriesExist() {
    const dirs = ['barbershops', 'profiles'];
    dirs.forEach(dir => {
      const fullPath = path.join(this.uploadsDir, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });
  }

  // Multer configuration for barbershop images
  getBarbershopUploadConfig() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, path.join(this.uploadsDir, 'barbershops'));
      },
      filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      }
    });

    const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
      // Check if file is an image
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'));
      }
    };

    return multer({
      storage,
      fileFilter,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 5 // Maximum 5 files per upload
      }
    });
  }

  // Multer configuration for profile images
  getProfileUploadConfig() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, path.join(this.uploadsDir, 'profiles'));
      },
      filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      }
    });

    const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'));
      }
    };

    return multer({
      storage,
      fileFilter,
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB limit for profiles
        files: 1 // Only one profile image
      }
    });
  }

  // Process and optimize images
  async processImage(
    inputPath: string,
    outputPath: string,
    width: number = 800,
    height: number = 600,
    quality: number = 80
  ): Promise<void> {
    try {
      await sharp(inputPath)
        .resize(width, height, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality })
        .toFile(outputPath);

      // Remove original file if processing was successful
      if (inputPath !== outputPath) {
        fs.unlinkSync(inputPath);
      }
    } catch (error) {
      console.error('Error processing image:', error);
      throw new Error('Failed to process image');
    }
  }

  // Generate thumbnail
  async generateThumbnail(
    inputPath: string,
    outputPath: string,
    size: number = 200
  ): Promise<void> {
    try {
      await sharp(inputPath)
        .resize(size, size, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 70 })
        .toFile(outputPath);
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      throw new Error('Failed to generate thumbnail');
    }
  }

  // Delete file
  deleteFile(filePath: string): boolean {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  // Get file URL
  getFileUrl(filename: string, type: 'barbershops' | 'profiles'): string {
    return `/uploads/${type}/${filename}`;
  }

  // Validate image file
  validateImageFile(file: Express.Multer.File): { isValid: boolean; error?: string } {
    // Check file size
    if (file.size > 5 * 1024 * 1024) {
      return { isValid: false, error: 'File size too large. Maximum 5MB allowed.' };
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return { isValid: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' };
    }

    return { isValid: true };
  }

  // Clean up old files (can be called periodically)
  async cleanupOldFiles(olderThanDays: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const dirs = ['barbershops', 'profiles'];
    
    for (const dir of dirs) {
      const dirPath = path.join(this.uploadsDir, dir);
      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        
        for (const file of files) {
          const filePath = path.join(dirPath, file);
          const stats = fs.statSync(filePath);
          
          if (stats.mtime < cutoffDate) {
            this.deleteFile(filePath);
          }
        }
      }
    }
  }
}

export const fileStorageService = new FileStorageService();