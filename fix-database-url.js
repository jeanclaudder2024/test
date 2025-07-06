// Script to properly encode the DATABASE_URL password
const url = process.env.DATABASE_URL;

if (url) {
  // Parse the URL to extract components
  // Format: postgresql://username:password@host:port/database
  const urlPattern = /^postgresql:\/\/(.+?):(.+)@(.+):(\d+)\/(.+)$/;
  const matches = url.match(urlPattern);
  
  if (matches) {
    const [, username, password, host, port, database] = matches;
    const encodedPassword = encodeURIComponent(password);
    
    // Reconstruct the URL with the encoded password
    const fixedUrl = `postgresql://${username}:${encodedPassword}@${host}:${port}/${database}`;
    
    console.log('Original password:', password);
    console.log('Encoded password:', encodedPassword);
    console.log('\nFixed DATABASE_URL:');
    console.log(fixedUrl);
    
    console.log('\nTo fix this, update the DATABASE_URL environment variable with the encoded password.');
  }
}