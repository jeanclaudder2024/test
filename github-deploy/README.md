# Maritime Oil Brokerage Platform

An advanced maritime oil brokerage platform with real-time vessel tracking, port management, and intelligent routing capabilities.

## Features

- Real-time vessel tracking with live position updates
- Interactive maritime maps with port and refinery locations
- Comprehensive vessel and port management
- Advanced filtering and search capabilities
- User authentication and subscription management
- Admin dashboard with analytics
- Multi-language support (English/Arabic)

## Tech Stack

- **Frontend**: React + TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Node.js + Express, WebSocket support
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Maps**: Leaflet with maritime data layers
- **APIs**: OpenAI integration, Marine tracking services

## Quick Start

### Prerequisites

- Node.js 18+ 
- Supabase account
- OpenAI API key (optional for AI features)

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd maritime-platform
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

Edit `.env` with your actual values:
- Supabase database connection
- API keys for external services
- Session secrets

4. Set up database schema
```bash
npm run db:push
```

5. Start development server
```bash
npm run dev
```

## Environment Variables

```env
DATABASE_URL=your_supabase_database_url
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
OPENAI_API_KEY=your_openai_key
SESSION_SECRET=your_session_secret
```

## Deployment

This application is designed to work with:
- Vercel (recommended for easy deployment)
- Railway, Render, or similar Node.js platforms
- VPS with Node.js support

### Deploy to Vercel

1. Push code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically

## API Documentation

The platform includes RESTful APIs for:
- Vessel management and tracking
- Port and refinery data
- User authentication
- Real-time WebSocket connections
- Administrative functions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details