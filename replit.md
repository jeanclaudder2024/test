# PetroDealHub - Maritime Oil Brokerage Platform

## Overview

PetroDealHub is a comprehensive maritime oil brokerage platform that facilitates oil trading, vessel tracking, and commercial transactions in the maritime industry. The platform serves brokers, oil companies, maritime operators, and port authorities with real-time vessel tracking, AI-powered document generation, and subscription-based services.

## System Architecture

### Frontend Architecture
- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS with Shadcn/ui component library
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **Forms**: React Hook Form with Zod validation
- **Maps**: Leaflet.js for vessel tracking and geographic visualization
- **Animations**: Framer Motion for enhanced user experience

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Supabase Auth with custom user management
- **API Design**: RESTful endpoints with WebSocket for real-time updates
- **AI Integration**: OpenAI GPT-4o for document generation and data enhancement

### Database Architecture
- **Primary Database**: Supabase PostgreSQL
- **ORM**: Drizzle with schema-first approach
- **Connection**: postgres-js client with SSL support
- **Migrations**: SQL-based schema management

## Key Components

### Core Entities
1. **Vessels**: Oil tankers with real-time tracking, cargo information, and voyage data
2. **Ports**: Maritime ports with comprehensive operational details and connections
3. **Refineries**: Oil refineries with capacity and processing information
4. **Companies**: Real companies and AI-generated placeholder companies for trading
5. **Brokers**: Oil brokers with elite membership capabilities
6. **Documents**: AI-generated maritime documents (manifests, certificates, reports)

### Business Logic Services
- **Vessel Tracking Service**: Real-time position updates and voyage management
- **AI Enhancement Service**: OpenAI-powered data enrichment and document generation
- **Port Service**: Port management and operational data
- **Broker Service**: Elite membership and trading capabilities
- **Company Management**: Real/fake company system for negotiations
- **Document Generation**: Professional maritime document creation

### Authentication System
- **Primary**: Supabase Auth for user management
- **Fallback**: Custom JWT-based authentication
- **User Roles**: Admin, broker, standard user with role-based permissions
- **Subscriptions**: Trial and paid subscription management

## Data Flow

### Client-Server Communication
1. **API Requests**: RESTful endpoints under `/api/*` prefix
2. **Real-time Updates**: WebSocket connections for vessel position updates
3. **Authentication**: JWT tokens with Supabase integration
4. **Caching**: Server-side caching for vessel and port data with 5-minute TTL

### Database Operations
1. **Vessel Data**: Cached queries with regional filtering capabilities
2. **Document Generation**: AI-enhanced content stored in PostgreSQL
3. **User Management**: Supabase Auth with custom user profiles
4. **Company Relationships**: Complex many-to-many relationships for trading networks

### AI Integration Flow
1. **Data Enhancement**: OpenAI GPT-4o enriches vessel data with missing fields
2. **Document Generation**: AI creates professional maritime documents
3. **Content Creation**: Dynamic article and report generation for platform content

## External Dependencies

### Required Services
- **Supabase**: Primary database and authentication provider
- **OpenAI**: GPT-4o for AI-powered features (optional but recommended)

### Optional Services
- **MyShipTracking API**: Enhanced vessel tracking data
- **Marine Traffic API**: Additional maritime data sources
- **Stripe**: Payment processing for subscriptions

### Environment Variables
```
# Database (Required)
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...

# AI Services (Optional)
OPENAI_API_KEY=...

# External APIs (Optional)
MYSHIPTRACKING_API_KEY=...
MARINE_TRAFFIC_API_KEY=...

# Frontend Configuration
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_GOOGLE_MAPS_API_KEY=...
VITE_MAPBOX_ACCESS_TOKEN=...
```

## Deployment Strategy

### Production Deployment
- **Platform**: Render.com with Docker containerization
- **Build Process**: Vite build for frontend, esbuild for backend
- **Database**: Supabase PostgreSQL (managed service)
- **SSL**: Automatic HTTPS via Render
- **Scaling**: Autoscale configuration with starter plan support

### Development Environment
- **Local Development**: Vite dev server with Express backend
- **Database**: Remote Supabase connection
- **Hot Reloading**: Full-stack development with Vite HMR
- **Port Configuration**: Frontend (5173), Backend (5000)

### Container Configuration
- **Base Image**: Node.js 18 Alpine
- **Build Strategy**: Multi-stage build with dependency optimization
- **Security**: Non-root user execution
- **Performance**: Optimized layer caching and minimal image size

## Changelog
- June 12, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.