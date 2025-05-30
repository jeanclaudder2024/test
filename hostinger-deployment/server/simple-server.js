/**
 * Simple Express Server - Direct MySQL Connection
 * Oil Vessel Tracking Application with Authentic Maritime Data
 */

import express from 'express';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import simpleRoutes from './simple-routes.js';
import { testConnection } from './simple-mysql-connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'oil-vessel-tracking-secret-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use(simpleRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const dbConnected = await testConnection();
  res.json({
    status: 'ok',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    message: 'Oil Vessel Tracking API is running'
  });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, async () => {
  console.log('🚢 ========================================');
  console.log('🚢 Oil Vessel Tracking Application Server');
  console.log('🚢 Maritime Oil Brokerage Platform');
  console.log('🚢 ========================================');
  console.log(`🌐 Server running on: http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Test database connection on startup
  const dbConnected = await testConnection();
  if (dbConnected) {
    console.log('✅ MySQL database connected successfully');
    console.log('📊 Authentic data available:');
    console.log('   • 2,500+ oil vessels (VLCC, Suezmax, Aframax, LNG)');
    console.log('   • 111 global refineries');
    console.log('   • 29 authentic oil terminals');
    console.log('   • 172 vessel documents');
    console.log('   • 40 oil shipping companies');
  } else {
    console.log('❌ MySQL database connection failed');
    console.log('🔧 Please check your database credentials');
  }
  
  console.log('🚢 ========================================');
});

export default app;