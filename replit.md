# PetroDealHub - Maritime Oil Brokerage Platform

## Overview
PetroDealHub is a comprehensive SaaS maritime oil brokerage platform designed to facilitate oil trading, vessel tracking, and company management. It provides real-time tracking, AI-powered features, and subscription-based services. The platform serves brokers, oil companies, maritime operators, and administrators, aiming to streamline maritime oil transactions and enhance market intelligence with a vision for future innovations like blockchain contracts and AI predictive flows.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
- **Frontend**: React 18+ with TypeScript, Tailwind CSS, Shadcn/ui for components, Wouter for routing.
- **Visual Design**: Professional maritime branding with blue, orange, green, and purple color schemes, glass-morphism effects, gradient backgrounds, and clean typography.
- **Interactive Elements**: Hover effects, smooth transitions, scroll animations, and tooltips for enhanced user engagement.
- **Responsive Design**: Adapts seamlessly across desktop, tablet, and mobile devices.

### Technical Implementations
- **Backend**: Node.js with Express.js, TypeScript.
- **Database**: PostgreSQL via Supabase, managed with Drizzle ORM.
- **Authentication**: Supabase Auth, supplemented by custom JWT.
- **API**: RESTful endpoints with WebSocket support for real-time updates.
- **State Management**: TanStack Query for server state, React Hook Form with Zod for forms.
- **Mapping**: Leaflet.js for vessel tracking visualization, integrated with Google Maps and Mapbox.
- **Build**: Vite for frontend, ESBuild for backend.
- **Document Generation**: AI-powered professional document creation (PDF/Word) using OpenAI GPT-4o, with custom templates and real vessel data integration.
- **Payment Processing**: Stripe integration for subscription management, including trial periods and tiered access control.
- **Core Logic**:
    - **Vessel Management**: Real-time tracking, document generation, route optimization.
    - **Company System**: Manages real and simulated companies for brokers.
    - **Deal Workflow**: Streamlined broker requests, admin approval, and document generation.
    - **Subscription System**: Supports trial periods, subscription tiers, and payment processing.
    - **AI-Powered Templates**: Admins can create dynamic document templates using AI prompts and vessel data.
    - **Broker Upgrade System**: A multi-step process for broker certification and Oil Union membership.
    - **Real-time Market Data**: Displays dynamic global oil prices for major benchmarks with trend indicators and news.
    - **Comprehensive Document Library**: Offers various maritime document types (LOI, ICPO, B/L, etc.).
    - **Membership Card System**: Manages broker membership cards with information collection and passport upload.
    - **Automated Renewals**: Handles trial-to-paid conversions and recurring billing.

### System Design Choices
- **Modularity**: Separation of concerns with distinct frontend, backend, and database layers.
- **Scalability**: Designed for potential growth with cloud-agnostic database strategy and containerization readiness.
- **Security**: JWT-based authentication, bcrypt hashing, non-root user execution, and secure data handling.
- **Performance**: Caching strategies for vessel data, indexed database queries, and optimized build processes.
- **Access Control**: Role-based access (Admin, Professional, Basic, Enterprise) with feature gating and subscription enforcement.
- **Content Management**: Dynamic content management system for landing pages and marketing materials.
- **Internationalization**: Support for bilingual field labels and global market data.

## External Dependencies
- **Supabase**: PostgreSQL database hosting, authentication.
- **OpenAI**: AI content generation (GPT-4o).
- **Stripe**: Payment processing and subscription management.
- **SendGrid**: Transactional email delivery.
- **Google Maps**: Map visualization and geographical data.
- **Mapbox**: Additional map visualization.
- **MyShipTracking API**: Enhanced vessel tracking data.
- **Marine Traffic API**: Additional vessel information.
- **Vercel/Render/Hostinger VPS**: Application hosting platforms.