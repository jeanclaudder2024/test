// Simple Hostinger Setup for Oil Vessel Tracking Platform
const fs = require('fs');
const path = require('path');

console.log('Setting up Oil Vessel Tracking Platform for Hostinger...\n');

// Create environment file if it doesn't exist
if (!fs.existsSync('.env')) {
    const envTemplate = `# Supabase Database Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Database URL (Supabase PostgreSQL connection string)
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres

# Required API Keys
OPENAI_API_KEY=your_openai_api_key_here

# Application Settings
NODE_ENV=production
PORT=3000
`;

    fs.writeFileSync('.env', envTemplate);
    console.log('✅ Created .env template file');
    console.log('⚠️  Please edit .env file with your actual Supabase credentials');
}

// Create simple package.json scripts for production
const packagePath = './package.json';
if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Ensure we have production scripts
    packageJson.scripts = {
        ...packageJson.scripts,
        "start": "node server/index.js",
        "build": "vite build",
        "build:server": "tsc server/index.ts --outDir dist",
        "deploy": "npm run build && npm run build:server"
    };
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated package.json with production scripts');
}

console.log('\n📋 Next steps for Hostinger deployment:');
console.log('1. Edit .env file with your Supabase credentials');
console.log('2. Run: npm install');
console.log('3. Run: npm run build');
console.log('4. Upload all files to your Hostinger hosting');
console.log('5. Set up Node.js application in Hostinger control panel');
console.log('6. Point the startup file to: server/index.js');
console.log('\n✅ Setup complete!');