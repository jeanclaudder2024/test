# PetroDealHub - Maritime Oil Brokerage Platform

## Overview

PetroDealHub is a comprehensive maritime oil brokerage platform that facilitates oil trading, vessel tracking, and deal negotiations in the global maritime industry. The platform combines real-time vessel tracking, port management, and AI-powered document generation to streamline complex maritime logistics and commercial transactions.

The application serves oil brokers, maritime companies, port authorities, and shipping coordinators by providing tools for vessel tracking, company management, deal workflows, and subscription-based access with tiered service plans.

## System Architecture

### Frontend Architecture
- **Framework**: React 18+ with TypeScript for type safety
- **Styling**: Tailwind CSS for responsive design with Shadcn/ui components
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Forms**: React Hook Form with Zod validation for robust form handling
- **Animation**: Framer Motion for advanced UI animations
- **Maps**: Leaflet.js for interactive vessel tracking maps

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript for type safety across the stack
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Supabase for user authentication and session management
- **API Design**: RESTful API with structured error handling

### Database Strategy
- **Primary Database**: Supabase PostgreSQL instance
- **ORM**: Drizzle ORM for type-safe database queries
- **Schema Management**: Database migrations and schema evolution through Drizzle Kit
- **Backup Strategy**: Supabase handles automated backups and replication

## Key Components

### Authentication System
- **Provider**: Supabase authentication with email/password and OAuth support
- **Session Management**: JWT tokens with refresh token rotation
- **Role-Based Access**: User roles (user, admin, broker) with permission-based routing
- **Subscription Management**: Trial periods and subscription status tracking

### Vessel Management
- **Real-time Tracking**: Live vessel positions with movement history
- **Comprehensive Data**: Vessel specifications, cargo details, route information
- **AI Enhancement**: OpenAI integration for generating missing vessel data
- **Regional Filtering**: Vessels organized by geographical regions

### Company Management
- **Dual System**: Real companies (admin-managed) and fake companies (auto-generated)
- **Deal Workflow**: Broker requests, admin approvals, document generation
- **Professional Profiles**: Complete company information with financial data

### Document System
- **Professional Documents**: Admin-managed document templates
- **AI Generation**: OpenAI-powered content generation for maritime documents
- **Vessel Associations**: Many-to-many relationships between vessels and documents

### Port & Refinery Management
- **Global Coverage**: Comprehensive port and refinery databases
- **Operational Data**: Capacity, specifications, contact information
- **Geographic Integration**: Coordinate-based mapping and distance calculations

## Data Flow

1. **User Authentication**: Supabase handles user login/registration and session management
2. **Data Fetching**: React Query manages API calls with caching and background updates
3. **Real-time Updates**: WebSocket connections for live vessel position updates
4. **Database Operations**: Drizzle ORM provides type-safe database interactions
5. **AI Integration**: OpenAI API enhances data and generates professional documents
6. **Caching Strategy**: Multi-level caching for vessels, ports, and refineries

## External Dependencies

### Required Services
- **Supabase**: Database, authentication, and real-time subscriptions
- **OpenAI API**: AI-powered content generation and data enhancement
- **Stripe**: Payment processing for subscription management (optional)

### Optional Integrations
- **MyShipTracking API**: Enhanced vessel tracking data
- **Marine Traffic API**: Additional vessel position data
- **SendGrid**: Email notifications and marketing communications

### Maps & Geolocation
- **Leaflet.js**: Interactive maps for vessel visualization
- **Google Maps API**: Alternative mapping service
- **Mapbox**: Advanced mapping features

## Deployment Strategy

### Production Environment
- **Platform**: Render.com for web service hosting
- **Database**: Supabase PostgreSQL with connection pooling
- **Build Process**: Vite for frontend, esbuild for backend compilation
- **Container**: Docker with Node.js 18 Alpine base image

### Environment Configuration
- **Development**: Local development with hot reloading
- **Staging**: Preview deployments for testing
- **Production**: Optimized builds with CDN and caching

### Performance Optimizations
- **Code Splitting**: Lazy loading of routes and components
- **Image Optimization**: Compressed images with proper formats
- **API Caching**: Redis-like caching for frequently accessed data
- **Database Indexing**: Optimized queries with proper indexes

## Changelog

- June 12, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.