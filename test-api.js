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

async function testEndpoints() {
  console.log('🧪 Testing API Endpoints\n');
  
  try {
    // Test 1: Health check
    console.log('1. Testing Health Check...');
    const health = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/health',
      method: 'GET'
    });
    console.log(`   Status: ${health.status}`);
    console.log(`   Response: ${health.data}\n`);

    // Test 2: API info
    console.log('2. Testing API Info...');
    const apiInfo = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api',
      method: 'GET'
    });
    console.log(`   Status: ${apiInfo.status}`);
    console.log(`   Response: ${apiInfo.data}\n`);

    // Test 3: Get all amenities (public)
    console.log('3. Testing Get All Amenities...');
    const amenities = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/amenities',
      method: 'GET'
    });
    console.log(`   Status: ${amenities.status}`);
    console.log(`   Response: ${amenities.data}\n`);

    // Test 4: Get all barbershops (public)
    console.log('4. Testing Get All Barbershops...');
    const barbershops = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/barbershops',
      method: 'GET'
    });
    console.log(`   Status: ${barbershops.status}`);
    console.log(`   Response: ${barbershops.data}\n`);

    // Test 5: Try to create barbershop without auth (should fail)
    console.log('5. Testing Create Barbershop Without Auth (should fail)...');
    const createUnauth = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/barbershops',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test Barbershop',
        address: '123 Test St'
      })
    });
    console.log(`   Status: ${createUnauth.status}`);
    console.log(`   Response: ${createUnauth.data}\n`);

    console.log('✅ All basic tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testEndpoints();