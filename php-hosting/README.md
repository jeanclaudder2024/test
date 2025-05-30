# PHP Maritime Platform for Shared Hosting

This version allows you to deploy your maritime platform to regular shared hosting (like Hostinger's public_html) while keeping your Supabase database and all your data intact.

## What This Version Includes:

✅ **Full Maritime Platform** - Dashboard, vessel tracking, port management, interactive maps
✅ **Supabase Integration** - Connects to your existing Supabase database 
✅ **Your Existing Data** - All vessels, ports, and refineries remain unchanged
✅ **Modern Interface** - React components with Tailwind CSS styling
✅ **Interactive Maps** - Leaflet maps showing vessel and port locations
✅ **API Endpoints** - RESTful API for data access

## Installation Steps:

### 1. Upload Files
- Upload `index.php` and `config.php` to your `public_html` folder
- Make sure `config.php` is in the same directory as `index.php`

### 2. Configure Database
Edit `config.php` with your Supabase credentials:

```php
'supabase_url' => 'https://your-project.supabase.co',
'supabase_anon_key' => 'your_anon_key_here',
```

### 3. Set File Permissions
```bash
chmod 644 index.php
chmod 644 config.php
```

### 4. Test Your Application
Visit your domain - your maritime platform should load with all your existing data.

## Features That Work:

- **Dashboard** - Statistics and overview
- **Vessel Management** - List and view all vessels from your database
- **Port Directory** - Complete port information with locations
- **Interactive Maps** - Visual representation of vessels and ports
- **API Access** - RESTful endpoints for data integration

## Technical Details:

- **Frontend**: React 18 + Tailwind CSS (loaded via CDN)
- **Backend**: PHP with cURL for Supabase API calls
- **Database**: Your existing Supabase PostgreSQL database
- **Maps**: Leaflet.js for maritime visualization
- **Hosting**: Compatible with any PHP shared hosting

## API Endpoints:

- `/api/vessels` - Get all vessels
- `/api/ports` - Get all ports  
- `/api/refineries` - Get all refineries
- `/api/vessels/{id}` - Get specific vessel details

## Advantages of This Approach:

1. **No Code Changes** - Your original Node.js version remains unchanged
2. **Same Database** - Uses your existing Supabase data
3. **Shared Hosting Compatible** - Works on any PHP hosting plan
4. **Easy Deployment** - Just upload 2 files and configure
5. **Cost Effective** - Use your existing hosting plan

Your clients can test the full application immediately without any hosting upgrades or complex deployments.