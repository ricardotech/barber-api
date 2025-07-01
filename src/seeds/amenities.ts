import { AppDataSource } from '../config/database';
import { Amenity } from '../entities/Amenity';

export const seedAmenities = async () => {
  const amenityRepository = AppDataSource.getRepository(Amenity);
  
  // Check if amenities already exist
  const existingAmenities = await amenityRepository.count();
  if (existingAmenities > 0) {
    console.log('Amenities already seeded');
    return;
  }

  const amenitiesData = [
    { icon: 'wifi', name: 'Wi-Fi' },
    { icon: 'wheelchair-accessibility', name: 'Accessible' },
    { icon: 'car-outline', name: 'Parking' },
    { icon: 'human-handsup', name: 'Gender Neutral Toilets' },
    { icon: 'credit-card-outline', name: 'Credit Card' },
    { icon: 'air-conditioner', name: 'Air Conditioning' }
  ];

  const amenities = amenitiesData.map(data => {
    const amenity = new Amenity();
    amenity.icon = data.icon;
    amenity.name = data.name;
    return amenity;
  });

  await amenityRepository.save(amenities);
  console.log('Amenities seeded successfully');
};

// Run seeding if this file is executed directly
if (require.main === module) {
  AppDataSource.initialize()
    .then(async () => {
      await seedAmenities();
      await AppDataSource.destroy();
    })
    .catch(error => {
      console.error('Error seeding amenities:', error);
      process.exit(1);
    });
}