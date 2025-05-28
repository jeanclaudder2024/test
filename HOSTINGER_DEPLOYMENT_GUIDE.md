# 🚀 Hostinger Deployment Guide - Oil Vessel Tracking Application

## Complete Deployment Package for Your Maritime Platform

This guide helps you deploy your oil vessel tracking application with all authentic data to Hostinger hosting.

## 📊 Your Application Features
- **2,500+ authentic oil vessels** with real tracking data
- **111 global oil refineries** with operational details  
- **29 authentic oil terminals and ports**
- **172 vessel documents** (SDS, LOI, BL certificates)
- **40 oil shipping companies** with fleet information
- **Complete user management and authentication**
- **Real-time vessel tracking maps**
- **Document generation system**
- **Admin panel for content management**

## 🏗️ Hostinger Requirements

### Hosting Plan Requirements:
- **Business Hosting** or higher (for Node.js support)
- **Node.js 18+** runtime
- **Database**: MySQL or PostgreSQL
- **SSL Certificate** (included with Hostinger)
- **Custom Domain** (optional)

## 📁 Files to Upload to Hostinger

### 1. Application Files:
```
📁 Your Project Folder/
├── 📁 client/          # React frontend
├── 📁 server/          # Express backend
├── 📁 shared/          # Schemas and types
├── 📁 public/          # Static assets
├── 📁 dist/            # Built production files
├── package.json        # Dependencies
├── .env               # Environment variables
└── README.md          # Documentation
```

### 2. Database Files:
- `POSTGRESQL_MIGRATION_PACKAGE.sql` - Complete schema
- `COMPLETE_DATABASE_EXPORT.sql` - Your authentic data
- `database_schema.sql` - Schema documentation

## 🔧 Hostinger Setup Steps

### Step 1: Upload Files
1. **Access Hostinger File Manager** or use FTP
2. **Upload all project files** to public_html folder
3. **Set correct file permissions** (755 for folders, 644 for files)

### Step 2: Database Setup
1. **Create MySQL database** in Hostinger control panel
2. **Import schema**: Upload and run `POSTGRESQL_MIGRATION_PACKAGE.sql`
3. **Import data**: Upload and run your data export files
4. **Note database credentials** for environment configuration

### Step 3: Environment Configuration
Create `.env` file with Hostinger settings:
```env
# Hostinger Database Configuration
DATABASE_URL=mysql://username:password@localhost/database_name

# Application Settings
NODE_ENV=production
PORT=3000

# Session Security
SESSION_SECRET=your-secure-random-string

# Optional: API Keys
OPENAI_API_KEY=your-openai-key
STRIPE_SECRET_KEY=your-stripe-key
STRIPE_PUBLISHABLE_KEY=your-stripe-public-key
```

### Step 4: Node.js Configuration
1. **Enable Node.js** in Hostinger control panel
2. **Set Node.js version** to 18 or higher
3. **Install dependencies**: `npm install`
4. **Build application**: `npm run build`

### Step 5: Domain Setup
1. **Point domain** to your Hostinger hosting
2. **Configure SSL certificate**
3. **Set up redirects** if needed

## 🗄️ Database Migration for Hostinger

### MySQL Setup (Recommended for Hostinger):
```sql
-- 1. Create database in Hostinger control panel
-- 2. Import schema
SOURCE POSTGRESQL_MIGRATION_PACKAGE.sql;

-- 3. Import your authentic data
SOURCE COMPLETE_DATABASE_EXPORT.sql;

-- 4. Verify data import
SELECT COUNT(*) FROM vessels;    -- Should show 2500+
SELECT COUNT(*) FROM refineries; -- Should show 111
SELECT COUNT(*) FROM ports;      -- Should show 29
```

## ⚙️ Production Configuration

### Environment Variables for Hostinger:
```env
# Production Database (Hostinger MySQL)
DATABASE_URL=mysql://db_user:db_password@localhost/db_name

# Security Settings
NODE_ENV=production
SESSION_SECRET=hostinger-secure-session-key-2024

# Performance Settings
MAX_CONNECTIONS=100
TIMEOUT=30000

# Features
ENABLE_REAL_TIME_TRACKING=true
ENABLE_DOCUMENT_GENERATION=true
```

### Performance Optimization:
```json
{
  "scripts": {
    "start": "NODE_ENV=production node dist/index.js",
    "build": "vite build && npm run build:server",
    "build:server": "esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist"
  }
}
```

## 🔒 Security for Production

### Essential Security Steps:
1. **Strong database passwords**
2. **Secure session secrets**
3. **Enable HTTPS/SSL**
4. **Hide .env files** (add to .htaccess)
5. **Regular backups** of your authentic data

### .htaccess Configuration:
```apache
# Hide sensitive files
<Files ".env">
    Order allow,deny
    Deny from all
</Files>

# Enable HTTPS redirect
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

## 📈 Monitoring & Maintenance

### Health Checks:
- Monitor vessel data accuracy (2,500+ records)
- Check refinery information (111 locations)
- Verify document generation
- Test user authentication
- Monitor performance metrics

### Regular Maintenance:
- **Database backups** (weekly)
- **Application updates** (monthly)
- **Security patches** (as needed)
- **Performance monitoring** (ongoing)

## 🎯 Launch Checklist

Before going live:
- [ ] All 2,500+ vessels display correctly
- [ ] All 111 refineries show accurate data
- [ ] User registration/login works
- [ ] Document generation functions
- [ ] Maps load with authentic coordinates
- [ ] SSL certificate active
- [ ] Domain pointing correctly
- [ ] Database backups configured
- [ ] Performance acceptable
- [ ] No console errors

## 🚀 Go Live Process

1. **Final testing** on Hostinger staging
2. **DNS propagation** (24-48 hours)
3. **SSL certificate** activation
4. **Monitor initial traffic**
5. **User acceptance testing**

## 📞 Support Resources

### Hostinger Support:
- **Live Chat**: 24/7 technical support
- **Knowledge Base**: Comprehensive guides
- **Video Tutorials**: Step-by-step walkthroughs

### Application Support:
- Monitor authentic data integrity
- Regular security updates
- Performance optimization
- Feature enhancements

Your authentic oil vessel tracking data is incredibly valuable - this deployment ensures it remains secure and accessible while providing excellent performance for your users!