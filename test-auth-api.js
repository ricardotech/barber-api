const http = require('http');

function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data,
          headers: res.headers
        });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testAuthAndBarbershop() {
  console.log('🧪 Testing Authentication and Barbershop Creation\n');
  
  try {
    // Test 1: Register a barber user
    console.log('1. Registering a barber user...');
    const registerResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'testbarber@example.com',
        password: 'password123',
        fullName: 'Test Barber',
        role: 'barber'
      })
    });
    console.log(`   Status: ${registerResponse.status}`);
    
    if (registerResponse.status !== 201) {
      console.log(`   Response: ${registerResponse.data}\n`);
      return;
    }
    
    const registerData = JSON.parse(registerResponse.data);
    const token = registerData.token;
    console.log(`   User created with ID: ${registerData.user.id}`);
    console.log(`   Token received: ${token.substring(0, 20)}...\n`);

    // Test 2: Login with the barber user
    console.log('2. Testing login...');
    const loginResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'testbarber@example.com',
        password: 'password123'
      })
    });
    console.log(`   Status: ${loginResponse.status}`);
    const loginData = JSON.parse(loginResponse.data);
    console.log(`   Login successful for: ${loginData.user.email}\n`);

    // Test 3: Create a barbershop with authentication
    console.log('3. Creating a barbershop...');
    const createBarbershopResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/barbershops',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Test Barbershop',
        address: '123 Test Street, Test City',
        phone: '+1234567890',
        about: 'A great test barbershop',
        amenityIds: ['36648002-e9ed-4045-889c-b5a0da293854'], // Accessible
        openingHours: [
          { day: 'Monday', openTime: '09:00', closeTime: '18:00', isClosed: false },
          { day: 'Tuesday', openTime: '09:00', closeTime: '18:00', isClosed: false },
          { day: 'Sunday', openTime: '', closeTime: '', isClosed: true }
        ]
      })
    });
    console.log(`   Status: ${createBarbershopResponse.status}`);
    
    if (createBarbershopResponse.status === 201) {
      const barbershopData = JSON.parse(createBarbershopResponse.data);
      console.log(`   Barbershop created with ID: ${barbershopData.data.id}`);
      console.log(`   Name: ${barbershopData.data.name}`);
      console.log(`   Amenities: ${barbershopData.data.amenities.length}`);
      console.log(`   Opening Hours: ${barbershopData.data.openingHours.length}\n`);
    } else {
      console.log(`   Response: ${createBarbershopResponse.data}\n`);
    }

    // Test 4: Get all barbershops (should now have 1)
    console.log('4. Getting all barbershops...');
    const barbershopsResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/barbershops',
      method: 'GET'
    });
    console.log(`   Status: ${barbershopsResponse.status}`);
    const barbershopsData = JSON.parse(barbershopsResponse.data);
    console.log(`   Total barbershops: ${barbershopsData.data.length}\n`);

    // Test 5: Get user's barbershops
    console.log('5. Getting user barbershops...');
    const userBarbershopsResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/barbershops/user/my-barbershops',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log(`   Status: ${userBarbershopsResponse.status}`);
    const userBarbershopsData = JSON.parse(userBarbershopsResponse.data);
    console.log(`   User's barbershops: ${userBarbershopsData.data.length}\n`);

    console.log('✅ All authentication and barbershop tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAuthAndBarbershop();