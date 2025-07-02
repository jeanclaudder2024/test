# PetroDealHub - Maritime Oil Brokerage Platform

## Overview

PetroDealHub is a comprehensive maritime oil brokerage platform that facilitates oil trading, vessel tracking, and company management. The platform serves brokers, oil companies, maritime operators, and administrators with real-time tracking capabilities, AI-powered features, and subscription-based services.

## System Architecture

### Frontend Architecture
- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS with Shadcn/ui component library
- **Routing**: Wouter for client-side navigation
- **State Management**: TanStack Query (React Query) for server state
- **Forms**: React Hook Form with Zod validation
- **Maps Integration**: Leaflet.js for vessel tracking visualization
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript for type safety
- **Database ORM**: Drizzle ORM for PostgreSQL operations
- **Authentication**: Supabase Auth with custom user tables
- **API Design**: RESTful endpoints with WebSocket support for real-time updates

## Key Components

### Database Layer
- **Primary Database**: PostgreSQL via Supabase
- **Connection**: Drizzle ORM with connection pooling
- **Schema Management**: Type-safe schema definitions in `/shared/schema.ts`
- **Migration Strategy**: SQL files for manual schema updates

### Authentication System
- **Provider**: Supabase Auth as primary authentication service
- **Fallback**: Custom JWT-based authentication with bcrypt password hashing
- **User Management**: Custom users table with subscription tracking
- **Session Management**: JWT tokens with 7-day expiration

### Core Business Logic
- **Vessel Management**: Real-time tracking, document generation, route optimization
- **Company System**: Dual architecture with real companies and generated fake companies for brokers
- **Deal Workflow**: Broker requests, admin approval, document generation
- **Subscription System**: Trial periods, subscription tiers, payment processing

### External Integrations
- **AI Services**: OpenAI GPT-4o for content generation and vessel data enhancement
- **Maps**: Google Maps and Mapbox for visualization
- **Payments**: Stripe integration for subscription management
- **Email**: SendGrid for transactional emails

## Data Flow

### Core Data Pipeline
1. **Vessel Data**: Stored in PostgreSQL, enhanced with AI-generated details
2. **Company Management**: Real companies linked to fake companies for broker interactions
3. **Deal Processing**: Broker requests → Admin review → Document generation → Completion
4. **Real-time Updates**: WebSocket connections for live vessel position updates

### Caching Strategy
- **In-memory caching**: Regional vessel data with 5-minute expiration
- **Database optimization**: Indexed queries for performance
- **Regional filtering**: Cached vessel data by geographic regions

### Document Generation
- **AI-powered content**: OpenAI integration for professional maritime documents
- **PDF generation**: PDFKit for vessel certificates and cargo manifests
- **Template system**: Standardized document formats for maritime compliance

## External Dependencies

### Required Services
- **Supabase**: Database hosting and authentication
- **OpenAI**: AI content generation (optional but recommended)
- **Vercel/Render**: Application hosting platform

### Optional Integrations
- **MyShipTracking API**: Enhanced vessel tracking data
- **Marine Traffic API**: Additional vessel information
- **Stripe**: Payment processing for subscriptions
- **SendGrid**: Email delivery service

### Environment Variables
```
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
OPENAI_API_KEY=... (optional)
MYSHIPTRACKING_API_KEY=... (optional)
MARINE_TRAFFIC_API_KEY=... (optional)
```

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React app to `/dist/client`
- **Backend**: ESBuild bundles Express server to `/dist/index.js`
- **Assets**: Static files served from built frontend

### Container Configuration
- **Base Image**: Node.js 18 Alpine for security and performance
- **Port**: Configurable via PORT environment variable (default 5000)
- **Security**: Non-root user execution, minimal surface area

### Database Strategy
The application is designed to work with Drizzle ORM but does not require a specific PostgreSQL setup initially. The database schema can be applied to any PostgreSQL instance, including:
- Supabase PostgreSQL
- Render PostgreSQL
- Self-hosted PostgreSQL

The schema includes comprehensive tables for vessels, ports, refineries, companies, deals, and user management.

## Changelog

Changelog:
- June 12, 2025. Initial setup
- June 12, 2025. Enhanced Professional Documents with comprehensive maritime content generation including:
  * Executive Summary with vessel certification details
  * Complete technical specifications with capacity tables
  * Safety & regulatory compliance certifications
  * Current operational status and navigation data
  * Commercial & market information
  * Professional certification and authorization sections
  * Multi-page PDF formatting with PetroDealHub logo design
- June 12, 2025. Fixed PDF formatting issues:
  * Tables now properly sized to fit within page margins using dynamic column widths
  * Improved text spacing by removing excessive blank spaces and normalizing content
  * Enhanced paragraph formatting with consistent line spacing and proper justification
  * Added automatic page breaks for tables and content sections
  * Professional table styling with borders, alternating row colors, and proper cell padding
- June 12, 2025. Fixed PDF blank pages and enhanced document downloads:
  * Eliminated excessive blank pages by optimizing page break logic
  * Corrected company logo display with professional "P" symbol in white circle
  * Fixed watermark positioning with proper diagonal rotation and transparency
  * Added Word document download option alongside PDF downloads
  * Enhanced header layout with PETRODEALHUB branding and document metadata
  * Both PDF and Word formats now available with consistent company branding
- June 12, 2025. Enhanced Word document generation with proper .docx format:
  * Implemented authentic Microsoft Word document generation using docx library
  * Professional formatting with PETRODEALHUB maritime branding and blue theme colors
  * Structured headings, vessel information sections, and comprehensive content layout
  * Proper .docx file downloads that open correctly in Microsoft Word and other processors
  * Consistent company branding across both PDF and Word document formats
- June 13, 2025. Document Management System Complete Rebuild:
  * Completely removed old admin_documents table and replaced with new documents table
  * Rebuilt all API endpoints from /api/admin/documents to /api/documents with full CRUD operations
  * Fixed authentication token storage inconsistencies using 'authToken' consistently
  * Updated database schema with proper indexes and constraints for new documents table
  * Recreated admin user with emergency creation endpoint after database conflicts
  * System now ready for production use with clean architecture
- June 13, 2025. Maritime Document Management System Implementation:
  * Completely rebuilt document management system from scratch with maritime focus
  * Created new maritimeDocuments table replacing problematic old document systems
  * Implemented new API routes at /api/maritime-documents with full CRUD operations
  * Added comprehensive maritime document storage methods to storage layer
  * Removed all old document management code causing server startup errors
  * Server now running successfully with clean maritime document architecture
  * System supports certificate management, vessel associations, and professional document generation
- June 28, 2025. Fixed Ports Page and Admin Port Management Synchronization:
  * Resolved data synchronization issue between main ports page and admin port management
  * Updated main ports page to use same React Query endpoint (/api/admin/ports) as admin panel
  * Ensured proper cache invalidation when ports are added/modified via admin panel
  * Both pages now show identical data and stay synchronized in real-time
  * Applied same fix pattern used successfully for refineries synchronization
- June 30, 2025. Completely Disabled Automatic Refinery Seeding:
  * Fixed persistent issue where refineries were automatically re-added after deletion
  * Disabled seedRefineries() function in seedService.ts to prevent automatic seeding
  * Disabled seedRefineryData() function in refineryService.ts to prevent service-level seeding
  * Removed React Query caching for refineries (stale time: 0) for immediate fresh data
  * Added bulk delete endpoint /api/admin/refineries/clear-all for complete refinery removal
  * Refineries now stay deleted permanently and won't be re-added on server restart
- July 1, 2025. Enhanced Refinery Creation Form for Advanced Dashboard Features:
  * Expanded ProfessionalRefineryManagement form with comprehensive tabbed interface
  * Added Technical Specifications tab: distillation capacity, conversion capacity, hydrogen capacity, sulfur recovery, processing units, storage capacity
  * Added Financial Information tab: investment cost, operating costs, revenue, profit margin, market share
  * Added Compliance & Regulations tab: environmental certifications, safety record, workforce size, annual throughput, crude oil sources
  * Added Strategic Information tab: pipeline connections, shipping terminals, rail connections, nearest port details
  * Updated form data structure and resetForm function to include all 25+ enhanced fields
  * Created ENHANCED_REFINERY_COLUMNS.sql with complete database schema updates needed for advanced dashboard
  * All enhanced fields now support the sophisticated Command Center v2.0 dashboard features
- July 2, 2025. Fixed "Create Refinery Failed" Error with Comprehensive Field Support:
  * Updated shared/schema.ts to include all enhanced refinery fields matching database structure
  * Fixed admin API endpoint /api/admin/refineries to handle all comprehensive form fields
  * Created COMPLETE_ENHANCED_REFINERY_SCHEMA.sql for manual database column addition
  * ProfessionalRefineryManagement component now fully functional with all enhanced features
  * Admin panel uses ProfessionalRefineryManagement with tabbed interface as intended
  * System supports complete refinery data including technical, financial, compliance, and strategic details
  * Fixed processing capacity showing as 0 by updating form submission to include all comprehensive fields
  * Enhanced refinery detail page with beautiful comprehensive data display including:
    - Technical Specifications section (distillation capacity, conversion capacity, hydrogen capacity, processing units)
    - Financial Information section (investment cost, operating costs, revenue, profit margin)
    - Compliance & Safety section (safety record, workforce size, environmental certifications)
    - Strategic Infrastructure section (pipeline connections, shipping terminals, nearest ports)
    - Additional Information section (contact details, operations, products)
  * Applied beautiful glass-morphism design with color-coded sections and gradient backgrounds
- July 2, 2025. Enhanced Port Management System with Comprehensive Data Display:
  * Created comprehensive PortDetailView component with all 25+ port fields beautifully organized
  * Added comprehensive port data sections including:
    - Technical Specifications (vessel limits, depths, berths, channel specifications)
    - Operations & Management (port authority, operator, operating hours, throughput)
    - Infrastructure & Connectivity (rail/road connections, airport distance, geographic data)
    - Safety & Compliance (security levels, pilotage requirements, customs facilities)
    - Services & Financial Information (available services, facilities, cargo types, currency)
  * Enhanced port detail page with real-time operational monitoring and live environmental conditions
  * Applied same beautiful glass-morphism design with color-coded sections (blue, green, purple, orange, slate)
  * Port detail page now displays comprehensive data from existing extensive port schema
  * Real-time metrics showing active vessels, port utilization, traffic flow, and safety ratings
  * Environmental monitoring with tidal conditions, weather data, and operational alerts
- July 2, 2025. Advanced Port Creation System Implementation:
  * Created comprehensive AdvancedPortCreation component with 6 professional tabs (Basic Info, Technical, Contact, Safety, Infrastructure, Economic)
  * Implemented full database field support with 40+ comprehensive port fields including:
    - Technical specifications (capacity, vessel limits, berth details, channel depth)
    - Port authority & management information (operator, owner, contact details)
    - Safety & security (ISPS levels, pilotage, customs, quarantine facilities)
    - Infrastructure connectivity (rail/road connections, airport distance, storage capacity)
    - Economic information (charges, currency, financial details)
    - Weather & operational conditions (tidal range, restrictions, wait times)
  * Replaced simple port creation with advanced tabbed interface for complete data entry
  * Fixed schema validation for lat/lng coordinate transformation to decimal values
  * Professional form design with proper validation and error handling
  * System now supports comprehensive port data management matching full database capabilities

## User Preferences

Preferred communication style: Simple, everyday language.