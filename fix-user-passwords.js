import bcrypt from 'bcrypt';

async function generateHashes() {
  const users = [
    { email: 'admin@petrodealhub.com', password: 'admin123' },
    { email: 'demo@demo.com', password: 'demo123' },
    { email: 'test@test.com', password: 'test123' },
    { email: 'user@example.com', password: 'admin123' }
  ];

  console.log('-- UPDATE USERS WITH CORRECT PASSWORD HASHES');
  
  for (const user of users) {
    const hash = await bcrypt.hash(user.password, 10);
    console.log(`UPDATE users SET password = '${hash}' WHERE email = '${user.email}';`);
  }
}

generateHashes().catch(console.error);