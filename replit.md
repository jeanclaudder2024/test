# PetroDealHub - Maritime Oil Brokerage Platform

## Overview

PetroDealHub is a comprehensive maritime oil brokerage platform that leverages intelligent automation and interactive design to simplify complex maritime logistics and commercial transactions. The platform serves as a hub for oil trading, vessel tracking, company management, and deal negotiations in the maritime industry.

**Core Purpose:**
- Facilitate oil trading between brokers, companies, and maritime operators
- Provide real-time vessel tracking and voyage management
- Enable automated deal workflows and document generation
- Offer subscription-based access with tiered service plans
- Support both real companies and fake placeholder companies for negotiations

**Target Users:**
- Oil brokers and trading professionals
- Maritime companies and operators
- Port authorities and refineries
- Shipping and logistics coordinators
- Platform administrators

## System Architecture

The application follows a full-stack TypeScript architecture with a React frontend and Express.js backend:

**Frontend Stack:**
- React 18+ with TypeScript for type safety
- Tailwind CSS for responsive, modern UI design
- Framer Motion for advanced animations and interactions
- Wouter for lightweight client-side routing
- TanStack Query for efficient data fetching and caching
- React Hook Form with Zod validation for forms
- Shadcn/ui component library for consistent design
- Lucide React for scalable vector icons

**Backend Stack:**
- Express.js with TypeScript for API services
- PostgreSQL database with Drizzle ORM for type-safe database operations
- Supabase for authentication and real-time features
- WebSocket connections for live vessel tracking updates
- RESTful API architecture with proper error handling

**Database Architecture:**
- PostgreSQL as primary database (via Supabase)
- Drizzle ORM for schema management and migrations
- Custom authentication tables alongside Supabase Auth
- Comprehensive relational schema for vessels, ports, refineries, and companies

## Key Components

**Authentication System:**
- Dual authentication approach: custom user tables + Supabase Auth
- Role-based access control (admin, user, broker)
- Trial period management and subscription tracking
- OAuth integration capabilities for third-party login

**Vessel Management:**
- Real-time vessel tracking with geographic positioning
- Comprehensive vessel data including IMO, MMSI, cargo details
- AI-enhanced vessel data generation using OpenAI GPT-4
- Regional vessel distribution and caching system
- Voyage progress tracking and ETA calculations

**Port & Refinery Management:**
- Global database of ports with detailed operational information
- Refinery management with capacity and processing details
- Port-refinery connection mapping for logistics planning
- Distance calculation utilities for route optimization

**Company Management:**
- Real company profiles with authentic business data
- Fake company generation for broker negotiations
- Company partnership and connection tracking
- Deal management system for broker-company interactions

**Document Generation:**
- Professional maritime document templates
- AI-powered document content generation
- PDF generation for cargo manifests and certificates
- Vessel-document association system

**Professional Features:**
- Landing page content management system
- Subscription and payment processing integration
- Professional article management for industry insights
- Oil market alerts and notifications

## Data Flow

**Client-Server Communication:**
1. React frontend makes API calls to Express backend
2. Backend processes requests using Drizzle ORM
3. Database operations performed on Supabase PostgreSQL
4. Real-time updates pushed via WebSocket connections
5. Caching layer reduces database load for frequently accessed data

**Authentication Flow:**
1. User login through custom auth or Supabase Auth
2. JWT tokens generated for session management
3. Role-based route protection on both frontend and backend
4. Trial period and subscription status validation

**Data Enhancement Flow:**
1. Basic vessel data stored in database
2. AI enhancement service fills missing details using OpenAI
3. Geographic utilities calculate distances and routes
4. Caching system stores processed data for performance

## External Dependencies

**Required Services:**
- Supabase: Database hosting and authentication
- OpenAI API: AI-enhanced data generation and document creation
- Stripe: Payment processing for subscriptions (optional)

**Optional Integrations:**
- MyShipTracking API: Real-time vessel position data
- Marine Traffic API: Enhanced vessel tracking information
- Cohere API: Alternative AI service for document generation
- SendGrid: Email notifications and communications

**Development Dependencies:**
- Vite: Fast development server and build tool
- ESBuild: JavaScript bundling for production
- TypeScript: Type checking and development experience
- Drizzle Kit: Database schema management and migrations

## Deployment Strategy

**Production Environment:**
- Render.com deployment with Docker containerization
- PostgreSQL database on Supabase cloud platform
- Environment variable configuration for API keys
- Automatic builds triggered by GitHub commits

**Development Environment:**
- Local development with Vite dev server
- PostgreSQL connection to Supabase development database
- Hot module replacement for rapid development iteration
- TypeScript checking and error reporting

**Database Management:**
- Drizzle ORM for schema definitions and migrations
- SQL migration files for manual database updates
- Backup and recovery procedures via Supabase dashboard
- Performance optimization through indexing and caching

**Scalability Considerations:**
- Caching layer for frequently accessed vessel data
- Regional data partitioning for global vessel tracking
- WebSocket connection management for real-time features
- API rate limiting and error handling for external services

## Changelog

- June 12, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.