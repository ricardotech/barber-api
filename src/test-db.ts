import { AppDataSource } from './config/database';
import { User, Barbershop, Amenity, OpeningHour } from './entities';

const testDatabase = async () => {
  try {
    // Initialize database connection
    console.log('Connecting to database...');
    await AppDataSource.initialize();
    console.log('✅ Database connected successfully');

    // Get repositories
    const userRepository = AppDataSource.getRepository(User);
    const barbershopRepository = AppDataSource.getRepository(Barbershop);
    const amenityRepository = AppDataSource.getRepository(Amenity);
    const openingHourRepository = AppDataSource.getRepository(OpeningHour);

    // Test 1: Check if amenities exist
    console.log('\n📋 Testing amenities...');
    const amenities = await amenityRepository.find();
    console.log(`✅ Found ${amenities.length} amenities`);
    amenities.forEach(amenity => {
      console.log(`  - ${amenity.name} (${amenity.icon})`);
    });

    // Test 2: Create a test user
    console.log('\n👤 Testing user creation...');
    const testUser = new User();
    testUser.email = 'test@example.com';
    testUser.password = 'hashedPassword123';
    testUser.role = 'barber';
    testUser.fullName = 'Test Barber';
    
    const savedUser = await userRepository.save(testUser);
    console.log(`✅ User created with ID: ${savedUser.id}`);

    // Test 3: Create a test barbershop with relationships
    console.log('\n🏪 Testing barbershop creation...');
    const testBarbershop = new Barbershop();
    testBarbershop.name = 'Test Barbershop';
    testBarbershop.address = '123 Test Street, Test City';
    testBarbershop.phone = '+1234567890';
    testBarbershop.about = 'A test barbershop for database validation';
    testBarbershop.createdBy = savedUser.id;
    testBarbershop.owner = savedUser;
    
    // Add some amenities (first 3)
    testBarbershop.amenities = amenities.slice(0, 3);
    
    const savedBarbershop = await barbershopRepository.save(testBarbershop);
    console.log(`✅ Barbershop created with ID: ${savedBarbershop.id}`);

    // Test 4: Create opening hours
    console.log('\n🕒 Testing opening hours creation...');
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const openingHours = days.map(day => {
      const hour = new OpeningHour();
      hour.day = day;
      hour.openTime = '09:00';
      hour.closeTime = '18:00';
      hour.isClosed = false;
      hour.barbershopId = savedBarbershop.id;
      hour.barbershop = savedBarbershop;
      return hour;
    });

    await openingHourRepository.save(openingHours);
    console.log(`✅ Created ${openingHours.length} opening hour records`);

    // Test 5: Test relationships - Fetch barbershop with all relations
    console.log('\n🔗 Testing relationships...');
    const barbershopWithRelations = await barbershopRepository.findOne({
      where: { id: savedBarbershop.id },
      relations: ['owner', 'amenities', 'openingHours']
    });

    if (barbershopWithRelations) {
      console.log('✅ Barbershop with relations found:');
      console.log(`  - Name: ${barbershopWithRelations.name}`);
      console.log(`  - Owner: ${barbershopWithRelations.owner.fullName} (${barbershopWithRelations.owner.email})`);
      console.log(`  - Amenities: ${barbershopWithRelations.amenities.length}`);
      console.log(`  - Opening Hours: ${barbershopWithRelations.openingHours.length}`);
    }

    // Test 6: Test user's barbershops relationship
    console.log('\n👥 Testing user relationships...');
    const userWithBarbershops = await userRepository.findOne({
      where: { id: savedUser.id },
      relations: ['barbershops']
    });

    if (userWithBarbershops) {
      console.log(`✅ User has ${userWithBarbershops.barbershops.length} barbershop(s)`);
    }

    // Cleanup test data
    console.log('\n🧹 Cleaning up test data...');
    await openingHourRepository.delete({ barbershopId: savedBarbershop.id });
    await barbershopRepository.delete(savedBarbershop.id);
    await userRepository.delete(savedUser.id);
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All database tests passed successfully!');

  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('📦 Database connection closed');
    }
  }
};

// Run the test
testDatabase();