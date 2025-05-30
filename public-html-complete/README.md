# Complete Maritime Platform for public_html

This package contains your full maritime platform with proper build structure, ready to deploy to any shared hosting service.

## Package Contents

```
/
├── index.php          # Main application file with API routing
├── config.php         # Database configuration (PRE-CONFIGURED)
├── .htaccess         # Apache configuration for hosting
├── favicon.ico       # Website icon
├── petrodeal-logo.png # Main logo
├── robots.txt        # SEO configuration
├── assets/           # All application assets
│   ├── petrodealhub-logo.png
│   ├── vessel-icon.svg
│   ├── port-icon.svg
│   ├── refinery-icon.svg
│   ├── oil-tanker.svg
│   ├── chemical-tanker.svg
│   ├── lng-carrier.svg
│   ├── lpg-carrier.svg
│   ├── crude-tanker.svg
│   ├── product-tanker.svg
│   ├── port.svg
│   └── refinery.svg
├── dist/              # Built application files
│   ├── main.css      # Compiled styles with maritime themes
│   └── main.js       # Complete React application
└── README.md         # This file
```

## Installation Steps

1. **Upload all files** to your `public_html` directory
2. **Edit config.php** with your Supabase database credentials
3. **Set file permissions** to 644 for all files
4. **Visit your domain** - your maritime platform loads immediately

## Database Configuration

Edit the values in `config.php`:

```php
'supabase_url' => 'https://your-project-id.supabase.co',
'supabase_anon_key' => 'your_actual_anon_key_here',
'supabase_service_key' => 'your_actual_service_key_here',
```

## Features Included

- **Dashboard** with vessel and port statistics from your database
- **Vessel Management** displaying all your actual vessel data
- **Port Directory** with complete port information and locations
- **Interactive Maps** showing real vessel and port positions using Leaflet
- **API Endpoints** for data access (`/api/vessels`, `/api/ports`, `/api/refineries`)
- **Responsive Design** optimized for desktop, tablet, and mobile
- **Professional Styling** with maritime gradient themes and glass effects

## Technical Architecture

- **Frontend**: React 18 with production-optimized JavaScript
- **Styling**: Custom CSS with maritime themes and Tailwind compatibility
- **Backend**: PHP with cURL for Supabase API integration
- **Database**: Your existing Supabase PostgreSQL database
- **Maps**: Leaflet.js for maritime visualization

## API Endpoints

Your application provides these endpoints:
- `GET /api/vessels` - Retrieve all vessels
- `GET /api/ports` - Retrieve all ports
- `GET /api/refineries` - Retrieve all refineries
- `GET /api/vessels/{id}` - Get specific vessel details

## Advantages

- Uses your existing Supabase database without any changes
- Works on any PHP shared hosting (no Node.js required)
- Includes proper build folder structure like professional applications
- Maintains all functionality from your original application
- Professional appearance suitable for client demonstrations