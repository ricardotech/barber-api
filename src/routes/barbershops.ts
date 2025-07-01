import { Router } from 'express';
import { barbershopController } from '../controllers/BarbershopController';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody, validateQuery, validateUUID } from '../middleware/validation';
import { CreateBarbershopDto, UpdateBarbershopDto, BarbershopQueryDto, BarbershopAmenityDto } from '../types/barbershop';

const router = Router();

// Public routes
router.get('/', validateQuery(BarbershopQueryDto), barbershopController.getAllBarbershops);
router.get('/:id', validateUUID('id'), barbershopController.getBarbershopById);
router.get('/:id/amenities', validateUUID('id'), barbershopController.getBarbershopAmenities);

// Protected routes - require authentication
router.use(authenticate);

// Routes for barbers and admins
router.get('/user/my-barbershops', authorize(['barber', 'admin']), barbershopController.getUserBarbershops);
router.post('/', authorize(['barber', 'admin']), validateBody(CreateBarbershopDto), barbershopController.createBarbershop);
router.put('/:id', authorize(['barber', 'admin']), validateUUID('id'), validateBody(UpdateBarbershopDto), barbershopController.updateBarbershop);
router.delete('/:id', authorize(['barber', 'admin']), validateUUID('id'), barbershopController.deleteBarbershop);

// Amenity management routes
router.post('/:id/amenities', authorize(['barber', 'admin']), validateUUID('id'), validateBody(BarbershopAmenityDto), barbershopController.addAmenities);
router.delete('/:id/amenities/:amenityId', authorize(['barber', 'admin']), validateUUID('id'), validateUUID('amenityId'), barbershopController.removeAmenity);

export default router;