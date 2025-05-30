# Complete Hostinger Deployment Instructions

## Folder Structure
Your `hostinger-deployment` folder contains:

```
hostinger-deployment/
├── server/              # Complete backend server
├── shared/              # Shared database schemas
├── package.json         # All dependencies
├── .env.example         # Environment variables template
└── README.md           # This guide
```

## Step-by-Step Deployment Process

### 1. Complete the Build Process
Before uploading to Hostinger, run these commands in your main project folder:

```bash
# Build the React frontend
npm run build

# This creates a 'dist' folder with all frontend files
```

### 2. Upload Files to Hostinger
Upload these items to your Hostinger hosting directory:
- Everything from the `hostinger-deployment` folder
- The `dist` folder (created after running `npm run build`)
- Your `node_modules` folder (or run `npm install` on the server)

### 3. Environment Configuration
Create a `.env` file in your hosting root directory with your actual values:

```env
DATABASE_URL=your_actual_postgresql_url
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
MYSHIPTRACKING_API_KEY=your_api_key
OPENAI_API_KEY=your_openai_key
NODE_ENV=production
PORT=5000
SESSION_SECRET=your_secure_random_string
```

### 4. Install Dependencies on Hostinger
Once files are uploaded, run:
```bash
npm install --production
```

### 5. Start Your Application
```bash
npm start
```

## Required Hosting Features
Ensure your Hostinger plan supports:
- Node.js applications
- PostgreSQL database connections
- Environment variables
- Port 5000 access

## Database Requirements
Your application connects to:
- Supabase PostgreSQL database
- All tables must be created and populated
- Authentic vessel, port, and refinery data loaded

## Application Features
Your deployed app will include:
- Real-time vessel tracking
- Interactive maritime maps
- Professional trading dashboard
- Authentic oil industry data
- User authentication system

## Troubleshooting
If the app doesn't start:
1. Check environment variables are correctly set
2. Verify database connection
3. Ensure all dependencies are installed
4. Check server logs for specific errors

Your maritime oil brokerage platform is ready for professional hosting on Hostinger.