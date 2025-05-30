// Hostinger Deployment Setup Script
// Run this on your Hostinger server after uploading files

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Oil Vessel Tracking Platform on Hostinger...\n');

// Check if required files exist
const requiredFiles = [
    'package.json',
    'ecosystem.config.js',
    'server/index.ts',
    'client/src/main.tsx'
];

console.log('📋 Checking required files...');
let allFilesPresent = true;

requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} - Found`);
    } else {
        console.log(`❌ ${file} - Missing`);
        allFilesPresent = false;
    }
});

if (!allFilesPresent) {
    console.log('\n❌ Some required files are missing. Please upload all project files.');
    process.exit(1);
}

// Check for environment file
if (!fs.existsSync('.env')) {
    console.log('\n⚠️  No .env file found. Creating template...');
    
    const envTemplate = `# Database Configuration for Hostinger
DATABASE_URL=postgresql://username:password@hostname:port/database_name

# Required API Keys
OPENAI_API_KEY=your_openai_api_key_here
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Application Settings
NODE_ENV=production
PORT=3000

# Optional Services
STRIPE_SECRET_KEY=your_stripe_key_if_needed
SENDGRID_API_KEY=your_sendgrid_key_if_needed
`;

    fs.writeFileSync('.env', envTemplate);
    console.log('📝 Created .env template file');
    console.log('⚠️  Please edit .env file with your actual credentials before starting the app');
}

// Create logs directory
if (!fs.existsSync('logs')) {
    fs.mkdirSync('logs');
    console.log('📁 Created logs directory');
}

console.log('\n🎯 Next steps:');
console.log('1. Edit .env file with your database and API credentials');
console.log('2. Run: npm install --production');
console.log('3. Run: npm run build');
console.log('4. Run: npm install -g pm2');
console.log('5. Run: pm2 start ecosystem.config.js');
console.log('6. Configure your web server to serve static files and proxy API calls');
console.log('\n✅ Setup script completed!');