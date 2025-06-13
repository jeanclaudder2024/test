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

## User Preferences

Preferred communication style: Simple, everyday language.