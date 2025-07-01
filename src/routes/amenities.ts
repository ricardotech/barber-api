import { Router } from 'express';
import { amenityController } from '../controllers/AmenityController';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody, validateQuery, validateUUID } from '../middleware/validation';
import { CreateAmenityDto, UpdateAmenityDto, AmenityQueryDto, BarbershopAmenitiesDto } from '../types/amenity';

const router = Router();

// Public routes
router.get('/', validateQuery(AmenityQueryDto), amenityController.getAllAmenities);
router.get('/:id', validateUUID('id'), amenityController.getAmenityById);
router.post('/by-barbershops', validateBody(BarbershopAmenitiesDto), amenityController.getAmenitiesByBarbershops);

// Protected routes - require authentication and admin role
router.use(authenticate);
router.use(authorize(['admin']));

router.post('/', validateBody(CreateAmenityDto), amenityController.createAmenity);
router.put('/:id', validateUUID('id'), validateBody(UpdateAmenityDto), amenityController.updateAmenity);
router.delete('/:id', validateUUID('id'), amenityController.deleteAmenity);

export default router;