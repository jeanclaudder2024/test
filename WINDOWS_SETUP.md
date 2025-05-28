# Windows Setup Guide - Oil Vessel Tracking Application

## 🚀 Complete Windows Installation Guide

This guide helps you run your maritime oil brokerage platform on Windows with all authentic vessel data.

## 📋 Prerequisites

1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - Choose "LTS" version for stability

2. **Git** (optional but recommended)
   - Download from: https://git-scm.com/

3. **PostgreSQL** (for production database)
   - Download from: https://www.postgresql.org/download/windows/

## 🔧 Installation Steps

### Step 1: Download the Application
```bash
# If using Git
git clone [your-repository-url]
cd oil-vessel-tracking

# Or download and extract the ZIP file
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Environment Configuration
Create a `.env` file in the root directory:

```env
# Database Configuration (use your PostgreSQL instance)
DATABASE_URL=postgresql://username:password@localhost:5432/oil_vessel_tracking

# Optional: MySQL backup database
USE_MYSQL=false
MYSQL_HOST=your-mysql-host
MYSQL_USER=your-mysql-user
MYSQL_PASSWORD=your-mysql-password
MYSQL_DATABASE=your-mysql-database

# Application Settings
NODE_ENV=development
PORT=3000

# Optional: OpenAI for AI vessel optimization
OPENAI_API_KEY=your-openai-api-key

# Optional: Stripe for payments
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

### Step 4: Database Setup
```bash
# Create database schema
npm run db:push

# Import your authentic data (if you have export files)
# Run the POSTGRESQL_MIGRATION_PACKAGE.sql in your PostgreSQL database
```

### Step 5: Start the Application
```bash
# Development mode
npm run dev

# Or production mode
npm run build
npm start
```

## 🌐 Access Your Application

Open your browser and navigate to:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

## ✅ Features Available

Your oil vessel tracking platform includes:

### 🚢 Vessel Management
- Track 2,500+ authentic oil vessels (VLCC, Suezmax, Aframax, LNG)
- Real-time positioning and status updates
- Vessel document management (SDS, LOI, BL)

### 🏭 Refinery & Port Data
- 111 global oil refineries
- 29 authentic oil terminals and ports
- Interactive mapping with live data

### 📊 Business Features
- User registration and authentication
- Subscription management with Stripe
- Admin panel for content management
- Document generation and export

### 🎯 Analytics & Reporting
- Vessel tracking analytics
- Maritime industry insights
- Performance metrics

## 🔧 Windows-Specific Commands

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Check TypeScript
npm run check

# Database migrations
npm run db:push
```

## 🐛 Troubleshooting

### Common Windows Issues:

1. **Port Already in Use**
   ```bash
   netstat -ano | findstr :3000
   taskkill /PID [PID_NUMBER] /F
   ```

2. **Node.js PATH Issues**
   - Add Node.js to your Windows PATH environment variable
   - Restart command prompt after installation

3. **Database Connection Issues**
   - Ensure PostgreSQL is running
   - Check firewall settings
   - Verify connection string in .env file

4. **Permission Issues**
   - Run command prompt as Administrator
   - Check antivirus software settings

## 📁 Project Structure

```
oil-vessel-tracking/
├── client/                 # React frontend
├── server/                 # Express backend
├── shared/                 # Shared schemas and types
├── public/                 # Static assets
├── .env                    # Environment variables
├── package.json            # Dependencies
└── README.md              # Documentation
```

## 🔐 Security Notes

- Never commit .env files to version control
- Use strong passwords for database connections
- Keep API keys secure
- Enable Windows Firewall protection

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Verify all prerequisites are installed
3. Ensure environment variables are properly set
4. Contact support with specific error messages

Your authentic oil vessel tracking data is valuable - this setup preserves all your maritime industry information while optimizing for Windows performance!