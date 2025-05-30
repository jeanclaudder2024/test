# Maritime Oil Brokerage Platform - Complete Deployment Package

This package contains your complete Maritime Oil Brokerage Platform converted for PHP shared hosting deployment on Hostinger or any shared hosting provider.

## Complete Package Contents

**✅ Core Application Files:**
- `index.html` - Main application entry point with React CDN setup
- `app.js` - Complete React application bundle with all your components
- `api.php` - PHP backend for Supabase database integration
- `.htaccess` - Server configuration for proper routing
- `test.php` - Quick deployment verification test

**✅ Assets & Resources:**
- `public/petrodeal-logo.png` - Your maritime platform logo
- `public/assets/` - All vessel icons and images
- Complete original source code in `src/` and `server/` folders

**✅ Database Integration:**
- Pre-configured Supabase connection
- Access to your actual 240+ vessels
- Access to your actual 139+ ports
- All refineries, brokers, and trading data

## Deployment Instructions

### Step 1: Pre-Deployment Test
1. Visit `yourdomain.com/test.php` after upload
2. Should show: PHP version, cURL status, JSON support
3. This confirms your hosting environment is ready

### Step 2: Upload Complete Package
1. Extract ALL files from this package
2. Upload everything to your `public_html` folder
3. Maintain exact folder structure
4. Set file permissions: 644 for files, 755 for folders

### Step 3: Verify Database Connection
1. Test API: `yourdomain.com/api.php`
2. Should show: "Maritime Platform API is working"
3. Test vessels: `yourdomain.com/api.php?endpoint=vessels`
4. Should return your actual vessel data

### Step 4: Launch Application
1. Visit your domain: `yourdomain.com`
2. Application should load with full navigation
3. All sections should work: Dashboard, Vessels, Ports, etc.

## Features Included

**✅ Complete Navigation System**
- Dashboard with real-time statistics
- Vessels page with all your 240+ vessels
- Ports page with all your 139+ ports
- Refineries management
- Brokers network
- Trading dashboard
- Documents system
- Admin panel

**✅ Technical Features**
- Interactive maps with Leaflet.js
- Real-time data from your Supabase database
- Responsive design for all devices
- Professional styling with Tailwind CSS
- Proper error handling and fallbacks

## Troubleshooting Guide

**If you see "Database Connection Error":**
1. Check `yourdomain.com/api.php` first
2. Verify PHP error logs in hosting control panel
3. Ensure cURL extension is enabled
4. Check if your hosting blocks external API calls

**If pages don't load properly:**
1. Verify `.htaccess` file uploaded correctly
2. Check browser console for JavaScript errors
3. Ensure all CDN resources are loading
4. Verify hosting supports URL rewriting

**If API calls fail:**
1. Test direct Supabase connection
2. Check hosting firewall settings
3. Verify PHP version is 7.4 or higher
4. Ensure JSON extension is available

## File Structure Overview

```
public_html/
├── index.html          # Main app entry
├── app.js             # React application
├── api.php            # PHP backend
├── test.php           # Deployment test
├── .htaccess          # Server config
├── public/            # Assets & logo
├── src/               # Original React code
├── server/            # Original server code
├── shared/            # Shared schemas
└── README.md          # This guide
```

## Database Configuration

Your Supabase database is pre-configured with:
- URL: `https://hjuxqjpgqacekqixiqol.supabase.co`
- API Key: Already configured in the code
- Tables: vessels, ports, refineries, brokers
- Real data: All your existing maritime data

## Support & Verification

After deployment, you should have:
- Working maritime platform at your domain
- All your vessel and port data displaying
- Interactive maps showing vessel locations
- Full navigation between all sections
- Professional maritime industry interface

This is your complete, production-ready maritime platform converted for shared hosting deployment.