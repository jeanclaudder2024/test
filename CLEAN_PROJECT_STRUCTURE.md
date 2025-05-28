# 🎯 Professional Oil Vessel Tracking Application

## Clean, Organized Project Structure

This is a maritime oil brokerage platform with authentic vessel tracking data, cleaned and organized for professional development.

## 📁 Core Application Structure

```
oil-vessel-tracking/
├── 📁 src/
│   ├── 📁 client/                    # React Frontend
│   │   ├── 📁 components/            # UI Components
│   │   ├── 📁 pages/                 # Application Pages
│   │   ├── 📁 hooks/                 # Custom React Hooks
│   │   └── 📁 utils/                 # Frontend Utilities
│   │
│   ├── 📁 server/                    # Express Backend
│   │   ├── 📁 api/                   # API Routes
│   │   ├── 📁 database/              # Database Connection
│   │   ├── 📁 middleware/            # Express Middleware
│   │   └── 📁 utils/                 # Backend Utilities
│   │
│   └── 📁 shared/                    # Shared Types & Schemas
│       ├── types.ts                  # TypeScript Interfaces
│       └── schemas.ts                # Database Schemas
│
├── 📁 database/                      # Database Files
│   ├── schema.sql                    # Database Schema
│   ├── migration.sql                 # Data Migration
│   └── seed-data.sql                 # Sample Data
│
├── 📁 docs/                          # Documentation
│   ├── README.md                     # Project Overview
│   ├── API.md                        # API Documentation
│   └── DEPLOYMENT.md                 # Deployment Guide
│
├── 📁 config/                        # Configuration Files
│   ├── database.js                   # Database Config
│   └── environment.js                # Environment Setup
│
├── package.json                      # Dependencies
├── .env.example                      # Environment Template
└── start.bat                         # Windows Startup Script
```

## 🗄️ Authentic Data Included

- **2,500+ Oil Vessels** - VLCC, Suezmax, Aframax, LNG tankers
- **111 Global Refineries** - Complete operational data
- **29 Oil Terminals** - Authentic port information
- **172 Vessel Documents** - SDS, LOI, BL certificates
- **40 Shipping Companies** - Fleet and company data

## 🚀 Key Features

### Frontend (React + TypeScript)
- Vessel tracking dashboard
- Interactive maps with real coordinates
- User authentication system
- Document management interface
- Admin panel for content management

### Backend (Express + MySQL)
- RESTful API for all maritime data
- Direct MySQL database connection
- User authentication and sessions
- Document generation system
- Real-time vessel tracking

### Database (MySQL)
- Clean schema design
- Optimized queries for performance
- Authentic maritime industry data
- User management tables
- Document storage system

## 🎯 Files to Keep (Essential Only)

### Core Application:
- `src/client/` - Frontend React application
- `src/server/` - Backend Express server
- `src/shared/` - Shared TypeScript definitions
- `package.json` - Project dependencies
- `database/schema.sql` - Database structure

### Configuration:
- `.env.example` - Environment template
- `config/database.js` - Database connection
- `start.bat` - Quick startup script

### Documentation:
- `docs/README.md` - Project overview
- `docs/API.md` - API endpoints
- `docs/DEPLOYMENT.md` - Hosting guide

## 🗑️ Files to Remove (Unnecessary)

- All temporary export scripts
- Multiple migration files
- Attached assets folder
- Generated documents folder
- Multiple bat files
- Old database exports
- Development test files
- Unused import scripts

This creates a clean, professional structure that any developer can understand immediately!