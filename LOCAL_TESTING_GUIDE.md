# 🚀 Complete Local Testing Guide - Oil Vessel Tracking Application

## Before Deploying to Hostinger - Test Everything Locally

This guide helps you test your complete maritime oil brokerage platform on your PC to ensure everything works perfectly before deployment.

## 📋 What You'll Test

Your application includes extensive authentic data:
- **2,500+ real oil vessels** (VLCC, Suezmax, Aframax, LNG tankers)
- **111 global oil refineries** with operational details
- **29 authentic oil terminals and ports**
- **172 vessel documents** (SDS, LOI, BL certificates)
- **40 oil shipping companies** with fleet information
- **Complete user management system**
- **Real-time vessel tracking**
- **Document generation system**

## 🔧 Step 1: Local Environment Setup

### Download Required Software:
1. **Node.js 18+** - https://nodejs.org/ (choose LTS version)
2. **Git** (optional) - https://git-scm.com/
3. **PostgreSQL** - https://www.postgresql.org/download/windows/
4. **VS Code** (recommended) - https://code.visualstudio.com/

### Create Project Folder:
```bash
mkdir oil-vessel-tracking
cd oil-vessel-tracking
```

## 🗄️ Step 2: Database Testing Options

### Option A: PostgreSQL (Recommended for production)
```bash
# Install PostgreSQL locally
# Create database: oil_vessel_tracking
# Update .env with local PostgreSQL credentials
```

### Option B: Use Your Existing MySQL Database
```env
# In your .env file
USE_MYSQL=true
DATABASE_URL=mysql://u150634185_A99wL:jonny@2025@@sql301.infinityfree.com:3306/u150634185_oiltrak
```

### Option C: SQLite for Quick Testing
```env
# Lightweight option for initial testing
DATABASE_URL=sqlite:./test.db
```

## 📁 Step 3: Environment Configuration

Create `.env` file:
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/oil_vessel_tracking

# Or use your existing MySQL
USE_MYSQL=true
MYSQL_HOST=sql301.infinityfree.com
MYSQL_USER=u150634185_A99wL
MYSQL_PASSWORD=jonny@2025@
MYSQL_DATABASE=u150634185_oiltrak

# Application Settings
NODE_ENV=development
PORT=3000
SESSION_SECRET=your-random-secret-here

# Optional: API Keys for full functionality
OPENAI_API_KEY=your-openai-key
STRIPE_SECRET_KEY=your-stripe-key
STRIPE_PUBLISHABLE_KEY=your-stripe-public-key
```

## 🚀 Step 4: Installation & Testing Commands

```bash
# Install dependencies
npm install

# Check TypeScript
npm run check

# Set up database schema
npm run db:push

# Start development server
npm run dev
```

## ✅ Step 5: Testing Checklist

### 🌐 Frontend Testing (http://localhost:5173)
- [ ] Landing page loads correctly
- [ ] User registration works
- [ ] User login/logout functions
- [ ] Navigation menu responsive
- [ ] Mobile view works properly

### 🚢 Vessel Management Testing
- [ ] Vessel dashboard displays authentic data
- [ ] Search and filter vessels
- [ ] View vessel details and documents
- [ ] Real-time vessel tracking map
- [ ] Export vessel data

### 🏭 Refinery & Port Features
- [ ] Browse all 111 refineries
- [ ] View refinery details and locations
- [ ] Interactive map with authentic ports
- [ ] Search refineries by region/country

### 📊 Admin Panel Testing
- [ ] Admin login works
- [ ] User management functions
- [ ] Content management system
- [ ] Landing page editor
- [ ] Analytics and statistics

### 📄 Document System Testing
- [ ] Generate vessel documents (SDS, LOI, BL)
- [ ] Download PDF documents
- [ ] Document management interface
- [ ] Document search and filter

### 💳 Payment System Testing (if enabled)
- [ ] Subscription plans display
- [ ] Payment flow (test mode)
- [ ] User subscription management
- [ ] Invoice generation

## 🐛 Step 6: Common Issues & Solutions

### Database Connection Issues:
```bash
# Check if PostgreSQL is running
pg_ctl status

# Test MySQL connection
mysql -h sql301.infinityfree.com -u u150634185_A99wL -p
```

### Port Already in Use:
```bash
# Find process using port 3000
netstat -ano | findstr :3000
# Kill the process
taskkill /PID [PID_NUMBER] /F
```

### Module Not Found Errors:
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules
npm install
```

### Environment Variables:
```bash
# Verify .env file is in root directory
# Check for typos in variable names
# Ensure no spaces around = signs
```

## 📈 Step 7: Performance Testing

### Load Testing:
- [ ] Test with multiple browser tabs
- [ ] Verify large dataset handling (2,500+ vessels)
- [ ] Check memory usage
- [ ] Test concurrent user scenarios

### Mobile Responsiveness:
- [ ] Test on different screen sizes
- [ ] Touch interactions work properly
- [ ] Maps function on mobile devices

## 🔒 Step 8: Security Testing

- [ ] User authentication works correctly
- [ ] Session management functions
- [ ] API endpoints require proper authorization
- [ ] Sensitive data is protected

## 📦 Step 9: Production Build Testing

```bash
# Build for production
npm run build

# Test production build locally
npm start

# Verify production build works at http://localhost:3000
```

## 🚀 Step 10: Pre-Deployment Checklist

Before deploying to Hostinger:
- [ ] All features tested and working
- [ ] Database migrations ready
- [ ] Environment variables documented
- [ ] Production build successful
- [ ] No console errors in browser
- [ ] All authentic data displays correctly
- [ ] Performance acceptable under load

## 📝 Step 11: Prepare for Hostinger Deployment

### Files to Upload:
- [ ] All source code files
- [ ] Built production files (dist folder)
- [ ] Environment configuration
- [ ] Database migration files
- [ ] Package.json with dependencies

### Hostinger Configuration:
- [ ] Node.js version compatibility (18+)
- [ ] Database connection string
- [ ] Environment variables setup
- [ ] Domain configuration

## 🎯 Success Indicators

Your application is ready for deployment when:
✅ All 2,500+ vessels display with authentic data
✅ All 111 refineries show correct information
✅ User registration and authentication work
✅ Document generation functions properly
✅ Maps display correctly with real coordinates
✅ No critical errors in browser console
✅ Performance is acceptable for your needs

Your authentic oil vessel tracking data is valuable - this testing ensures everything works perfectly before going live on Hostinger!