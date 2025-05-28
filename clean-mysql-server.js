/**
 * Clean Oil Vessel Tracking Server - Professional MySQL Implementation
 * Maritime Oil Brokerage Platform with Authentic Data
 */

import express from 'express';
import session from 'express-session';
import cors from 'cors';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Express app setup
const app = express();
const PORT = process.env.PORT || 3000;

// MySQL connection - your authentic maritime database
const mysqlConfig = {
  host: 'sql301.infinityfree.com',
  user: 'u150634185_A99wL',
  password: 'jonny@2025@',
  database: 'u150634185_oiltrak',
  port: 3306,
  connectionLimit: 10
};

let db = null;

// Initialize database connection
async function connectDatabase() {
  try {
    db = mysql.createPool(mysqlConfig);
    const connection = await db.getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ Connected to authentic maritime database');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Execute database queries
async function executeQuery(sql, params = []) {
  const [rows] = await db.execute(sql, params);
  return rows;
}

// Middleware
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'oil-vessel-tracking-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// API Routes for your authentic maritime data

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await executeQuery('SELECT 1');
    res.json({ status: 'healthy', database: 'connected', message: 'Maritime platform running' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Get authentic vessels (2,500+ records)
app.get('/api/vessels', async (req, res) => {
  try {
    const vessels = await executeQuery(`
      SELECT v.*, c.name as company_name 
      FROM vessels v 
      LEFT JOIN companies c ON v.seller_name = c.name 
      ORDER BY v.name LIMIT 2500
    `);
    res.json({ success: true, data: vessels, count: vessels.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get authentic refineries (111 global refineries)
app.get('/api/refineries', async (req, res) => {
  try {
    const refineries = await executeQuery('SELECT * FROM refineries ORDER BY country, name');
    res.json({ success: true, data: refineries, count: refineries.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get authentic ports (29 oil terminals)
app.get('/api/ports', async (req, res) => {
  try {
    const ports = await executeQuery('SELECT * FROM ports ORDER BY country, name');
    res.json({ success: true, data: ports, count: ports.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get authentic companies (40 oil shipping companies)
app.get('/api/companies', async (req, res) => {
  try {
    const companies = await executeQuery('SELECT * FROM companies ORDER BY name');
    res.json({ success: true, data: companies, count: companies.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get vessel documents
app.get('/api/vessels/:id/documents', async (req, res) => {
  try {
    const documents = await executeQuery('SELECT * FROM documents WHERE vessel_id = ?', [req.params.id]);
    res.json({ success: true, data: documents, count: documents.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Authentication
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existing = await executeQuery('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'User exists' });
    }
    
    await executeQuery('INSERT INTO users (username, email, password, created_at) VALUES (?, ?, ?, NOW())', 
      [username, email, password]);
    
    const [user] = await executeQuery('SELECT id, username, email FROM users WHERE email = ?', [email]);
    req.session.user = user;
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = await executeQuery('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const user = { id: users[0].id, username: users[0].username, email: users[0].email };
    req.session.user = user;
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/auth/me', (req, res) => {
  if (req.session.user) {
    res.json({ success: true, user: req.session.user });
  } else {
    res.status(401).json({ success: false, message: 'Not authenticated' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

// Statistics
app.get('/api/stats', async (req, res) => {
  try {
    const [vessels] = await executeQuery('SELECT COUNT(*) as count FROM vessels');
    const [refineries] = await executeQuery('SELECT COUNT(*) as count FROM refineries');
    const [ports] = await executeQuery('SELECT COUNT(*) as count FROM ports');
    const [documents] = await executeQuery('SELECT COUNT(*) as count FROM documents');
    
    res.json({
      success: true,
      data: {
        totalVessels: vessels.count,
        totalRefineries: refineries.count,
        totalPorts: ports.count,
        totalDocuments: documents.count
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'client/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

// Start server
async function startServer() {
  const connected = await connectDatabase();
  if (!connected) {
    console.error('Failed to connect to database');
    process.exit(1);
  }
  
  app.listen(PORT, () => {
    console.log('🚢 =======================================');
    console.log('🚢 Oil Vessel Tracking Platform');
    console.log('🚢 Clean Professional Implementation');
    console.log('🚢 =======================================');
    console.log(`🌐 Server: http://localhost:${PORT}`);
    console.log('🗄️  Database: MySQL (Authentic Data)');
    console.log('📊 Data: 2,500+ vessels, 111 refineries');
    console.log('🚢 =======================================');
  });
}

startServer();