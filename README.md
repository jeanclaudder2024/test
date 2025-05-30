# Maritime Oil Brokerage Platform

A professional maritime oil brokerage platform for vessel tracking and port management.

## Features

- 🚢 Real-time vessel tracking
- 🏭 Oil refinery management
- 🏖️ Port management system
- 📊 Professional dashboard
- 🗺️ Interactive maps
- 📋 Document management
- 🔐 Secure authentication

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:5000`

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── utils/          # Utility functions
├── server/                 # Express backend
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   └── utils/              # Server utilities
└── shared/                 # Shared types and schemas
```

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Maps**: Leaflet.js
- **Authentication**: Supabase Auth