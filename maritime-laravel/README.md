# Maritime Platform - Laravel Backend

This is a professional Laravel backend implementation for your maritime oil brokerage platform. It provides a robust API structure while maintaining compatibility with your existing Supabase database containing 240 vessels, 139 ports, and 70 refineries.

## Features

- **Professional Laravel Structure**: Clean MVC architecture with proper separation of concerns
- **API-First Design**: RESTful API endpoints for all maritime data
- **Database Integration**: Connects to your existing Supabase PostgreSQL database
- **Real Data**: Works with your authentic maritime data (vessels, ports, refineries)
- **Scalable Architecture**: Proper models, controllers, and routes organization

## Project Structure

```
maritime-laravel/
├── app/
│   ├── Models/
│   │   ├── Vessel.php          # Vessel model with relationships
│   │   ├── Port.php            # Port model with queries
│   │   └── Refinery.php        # Refinery model with scopes
│   └── Http/Controllers/Api/
│       ├── VesselController.php    # Vessel API endpoints
│       ├── PortController.php      # Port API endpoints
│       └── RefineryController.php  # Refinery API endpoints
├── config/
│   └── database.php            # Database configuration
├── routes/
│   └── api.php                 # API route definitions
├── public/
│   ├── index.php              # Laravel entry point
│   ├── app.js                 # Frontend application
│   └── index.html             # Main HTML page
└── composer.json              # PHP dependencies
```

## API Endpoints

### Vessels
- `GET /api/vessels` - List all vessels with pagination
- `GET /api/vessels/{id}` - Get specific vessel details
- `POST /api/vessels` - Create new vessel
- `PUT /api/vessels/{id}` - Update vessel
- `DELETE /api/vessels/{id}` - Delete vessel
- `GET /api/vessels/stats` - Vessel statistics
- `GET /api/vessels/tracking` - Real-time tracking data

### Ports
- `GET /api/ports` - List all ports
- `GET /api/ports/{id}` - Get specific port details
- `POST /api/ports` - Create new port
- `PUT /api/ports/{id}` - Update port
- `DELETE /api/ports/{id}` - Delete port
- `GET /api/ports/stats` - Port statistics

### Refineries
- `GET /api/refineries` - List all refineries
- `GET /api/refineries/{id}` - Get specific refinery details
- `POST /api/refineries` - Create new refinery
- `PUT /api/refineries/{id}` - Update refinery
- `DELETE /api/refineries/{id}` - Delete refinery
- `GET /api/refineries/stats` - Refinery statistics

### Dashboard
- `GET /api/dashboard/stats` - Combined statistics for dashboard

## Models Features

### Vessel Model
- Relationships with ports (departure/destination)
- Scopes for filtering by type, status, region
- Real-time tracking capabilities
- Comprehensive vessel data management

### Port Model
- Relationships with vessels (departing/arriving)
- Regional filtering
- Operational status tracking
- Capacity management

### Refinery Model
- Regional organization
- Operational status monitoring
- Capacity and utilization tracking
- Technical specifications

## Database Integration

The Laravel backend connects to your existing Supabase PostgreSQL database, preserving all your authentic maritime data:
- 240 vessels with real tracking information
- 139 ports across global regions
- 70 refineries with operational data

## Benefits Over PHP Implementation

1. **Professional Structure**: Laravel provides industry-standard MVC architecture
2. **Built-in Features**: Authentication, validation, caching, and more
3. **ORM Integration**: Eloquent ORM for elegant database interactions
4. **API Resources**: Structured JSON responses with proper formatting
5. **Middleware Support**: Request filtering, CORS, rate limiting
6. **Error Handling**: Comprehensive error management and logging
7. **Testing Framework**: Built-in testing capabilities
8. **Scalability**: Easy to extend and maintain

## Frontend Integration

The frontend (`app.js`) seamlessly integrates with Laravel APIs:
- Maintains all existing features (Dashboard, Vessels, Ports, Refineries)
- Interactive maps and real-time tracking
- Admin panel functionality
- Document management
- Trading interface

## Deployment Options

This Laravel structure can be deployed on:
- Shared hosting providers that support PHP 8.1+
- VPS servers with full Laravel support
- Cloud platforms (AWS, Google Cloud, Azure)
- Dedicated hosting with composer support

## Environment Configuration

Configure your database connection in `.env`:
```
DB_CONNECTION=pgsql
DATABASE_URL=your_supabase_connection_string
```

The application will automatically connect to your existing Supabase database and work with your current maritime data without any migration needed.