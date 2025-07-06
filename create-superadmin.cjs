// Create superadmin user using application API endpoints
const http = require('http');

const createSuperadminUser = async () => {
  const userData = {
    email: 'superadmin@petrodealhub.com',
    password: 'admin123',
    firstName: 'Super',
    lastName: 'Admin',
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

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('Response Status:', res.statusCode);
        console.log('Response Body:', data);
        
        if (res.statusCode === 201 || res.statusCode === 200) {
          console.log('✅ Superadmin user created successfully!');
          console.log('📧 Email: superadmin@petrodealhub.com');
          console.log('🔑 Password: admin123');
          console.log('👑 Role: admin');
          resolve(data);
        } else {
          console.log('❌ Failed to create superadmin user');
          reject(new Error(`Failed with status: ${res.statusCode}`));
        }
      });
    });

    req.on('error', (err) => {
      console.error('❌ Request error:', err.message);
      reject(err);
    });

    req.write(postData);
    req.end();
  });
};

// Run the creation
createSuperadminUser()
  .then(() => {
    console.log('\n🎉 Process completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Process failed:', error.message);
    process.exit(1);
  });