# Oil Vessel Tracking Platform - Technical Overview

## Overview

The Oil Vessel Tracking Platform (PetroDealHub) is a comprehensive maritime oil brokerage system that serves as an intelligent hub for oil trading, vessel tracking, company management, and deal negotiations. The platform leverages real-time data, AI enhancement, and modern web technologies to streamline complex maritime logistics operations.

## System Architecture

### Frontend Architecture
- **Framework**: React 18+ with TypeScript for type safety
- **Styling**: Tailwind CSS with custom components via shadcn/ui
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **Form Handling**: React Hook Form with Zod validation
- **Maps Integration**: Leaflet.js for interactive vessel tracking maps
- **Authentication**: Supabase Auth with custom user management

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for full-stack type safety
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Architecture**: RESTful APIs with real-time WebSocket support
- **File Bundling**: Vite for development and esbuild for production builds

### Database Design
- **Primary Database**: PostgreSQL via Supabase
- **Schema Management**: Drizzle ORM with migration support
- **Authentication**: Custom user table integrated with Supabase Auth
- **Data Structure**: Normalized schema with proper foreign key relationships

## Key Components

### Core Data Models
1. **Vessels**: Comprehensive vessel tracking with position, cargo, and operational data
2. **Ports**: Global port management with detailed specifications and capabilities
3. **Refineries**: Oil refinery data with capacity and operational information
4. **Companies**: Dual system supporting both real companies and generated placeholder entities
5. **Users**: Custom authentication with role-based access control
6. **Documents**: Professional document management with AI-generated content

### Authentication System
- **Backend**: Custom JWT-based authentication with bcrypt password hashing
- **Frontend**: Supabase Auth integration for seamless user experience
- **Session Management**: Secure session handling with automatic token refresh
- **Role Management**: Admin, broker, and user roles with appropriate permissions

### Real-time Features
- **WebSocket Integration**: Live vessel position updates
- **Cache Management**: Intelligent caching for performance optimization
- **Regional Data**: Vessel distribution across global maritime regions

### AI Integration
- **OpenAI Integration**: AI-powered vessel data enhancement and document generation
- **Content Generation**: Automatic creation of professional maritime documents
- **Data Enhancement**: Intelligent filling of missing vessel and cargo information

## Data Flow

### Client-Side Flow
1. **Authentication**: Users authenticate via Supabase Auth
2. **Data Fetching**: TanStack Query manages API calls with caching
3. **Real-time Updates**: WebSocket connections for live vessel tracking
4. **Map Rendering**: Leaflet.js displays vessels and ports on interactive maps

### Server-Side Flow
1. **Request Processing**: Express.js handles incoming API requests
2. **Authentication**: JWT token validation for protected routes
3. **Database Operations**: Drizzle ORM executes type-safe database queries
4. **Cache Management**: Redis-like caching for frequently accessed data
5. **External APIs**: Integration with marine tracking services (optional)

### Database Architecture
- **Vessels Table**: Core vessel tracking with positions and cargo data
- **Ports Table**: Comprehensive port information with technical specifications
- **Companies Table**: Dual-purpose for real and generated company data
- **Documents Table**: Professional document storage with metadata
- **Users Table**: Custom user management with subscription tracking

## External Dependencies

### Required Services
- **Supabase**: Database hosting and authentication services
- **PostgreSQL**: Primary database engine via Supabase

### Optional Services
- **OpenAI API**: AI-powered content generation and data enhancement
- **MyShipTracking API**: Real-time vessel position data
- **Marine Traffic API**: Additional vessel tracking capabilities
- **Google Maps API**: Alternative mapping solution
- **Mapbox API**: Map tiles and geocoding services

### Development Dependencies
- **Vite**: Development server and build tooling
- **TypeScript**: Type checking and compilation
- **ESLint/Prettier**: Code quality and formatting
- **Drizzle Kit**: Database schema management

## Deployment Strategy

### Production Environment
- **Platform**: Render.com for seamless deployment
- **Containerization**: Docker with multi-stage builds for optimization
- **Database**: Supabase PostgreSQL with connection pooling
- **Environment Variables**: Secure configuration management

### Build Process
1. **Frontend Build**: Vite compiles React application with Tailwind CSS
2. **Backend Build**: esbuild bundles Express server with dependencies
3. **Docker Image**: Multi-stage Docker build for production optimization
4. **Deployment**: Render automatically deploys from GitHub repository

### Performance Optimizations
- **Caching Strategy**: Multiple cache layers for vessels, ports, and regional data
- **Bundle Optimization**: Tree-shaking and code splitting for minimal bundle size
- **Database Indexing**: Optimized indexes for frequent queries
- **Connection Pooling**: Efficient database connection management

### Security Measures
- **Authentication**: JWT tokens with secure password hashing
- **Environment Variables**: Secure API key management
- **Database Security**: Parameterized queries to prevent SQL injection
- **CORS Configuration**: Proper cross-origin resource sharing setup

## Changelog

- June 12, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.