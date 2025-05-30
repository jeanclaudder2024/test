# Oil Vessel Tracking Platform

A comprehensive maritime oil vessel tracking application with real-time monitoring, interactive maps, and authentic vessel data from Supabase database.

## Features

- **Real-time Vessel Tracking**: Live monitoring of 5 oil vessels with authentic coordinates
- **Interactive Maps**: Leaflet-based maps showing vessels, ports, and refineries
- **Port & Refinery Data**: 68 ports and multiple refineries with detailed information
- **WebSocket Connections**: Real-time updates for vessel positions
- **Vessel Details**: Comprehensive vessel information with port name resolution
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Technology Stack

- **Frontend**: React.js with TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express.js, WebSocket support
- **Database**: Supabase (PostgreSQL)
- **Maps**: Leaflet with custom vessel and port icons
- **Authentication**: Supabase Auth
- **Build Tool**: Vite
- **Deployment**: Render-ready configuration

## Quick Start

### Prerequisites
- Node.js 18+
- Supabase account with vessel data

### Installation
```bash
npm install
```

### Environment Variables
Create a `.env` file:
```
DATABASE_URL=your_supabase_connection_string
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
NODE_ENV=development
```

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## Deployment to Render

This application is configured for easy deployment to Render:

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Use these settings:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment: Node
4. Add your environment variables in Render dashboard

## Database Schema

The application uses Supabase with the following tables:
- `vessels` - Oil vessel information and current positions
- `ports` - Port data with coordinates and capacity
- `refineries` - Refinery locations and specifications

## Authentic Data

This application displays only authentic vessel data from your Supabase database:
- 5 real oil vessels with live tracking
- 68 actual ports with verified coordinates
- No synthetic or mock data generation

## License

MIT License