// Create superadmin user using application API endpoints
import http from 'http';

const createSuperadminUser = async () => {
  const userData = {
    email: 'superadmin@petrodealhub.com',
    firstName: 'Super',
    lastName: 'Admin',
    password: 'admin123',
    role: 'admin'
  };

  const postData = JSON.stringify(userData);

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      if (res.statusCode === 201) {
        console.log('✅ Superadmin user created successfully!');
        console.log(`Email: ${userData.email}`);
        console.log(`Password: ${userData.password}`);
        console.log(`Role: ${userData.role}`);
      } else {
        console.log('❌ Failed to create superadmin user');
        console.log('Status Code:', res.statusCode);
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request error:', error.message);
  });

  req.write(postData);
  req.end();
};

createSuperadminUser();