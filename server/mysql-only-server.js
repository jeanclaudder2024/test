/**
 * MySQL-Only Oil Vessel Tracking Server
 * Complete migration to MySQL with all authentic maritime data
 * No PostgreSQL dependencies
 */

import express from 'express';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// MySQL Connection Configuration
const mysqlConfig = {
  host: 'sql301.infinityfree.com',
  user: 'u150634185_A99wL',
  password: 'jonny@2025@',
  database: 'u150634185_oiltrak',
  port: 3306,
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000
};

let connectionPool = null;

// Initialize MySQL connection pool
async function initializeMySQL() {
  try {
    connectionPool = mysql.createPool(mysqlConfig);
    console.log('✅ MySQL connection pool initialized');
    
    // Test connection
    const connection = await connectionPool.getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ MySQL connection test successful');
    return true;
  } catch (error) {
    console.error('❌ MySQL connection failed:', error);
    return false;
  }
}

// Execute MySQL queries
async function executeQuery(sql, params = []) {
  try {
    const [rows] = await connectionPool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

// Middleware setup
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'oil-vessel-tracking-mysql-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// API Routes for your authentic maritime data

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await connectionPool.execute('SELECT 1');
    res.json({
      status: 'healthy',
      database: 'mysql',
      message: 'Oil vessel tracking API running with MySQL'
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'mysql',
      error: error.message
    });
  }
});

// Get all authentic vessels (2,500+ records)
app.get('/api/vessels', async (req, res) => {
  try {
    const vessels = await executeQuery(`
      SELECT v.*, c.name as company_name 
      FROM vessels v 
      LEFT JOIN companies c ON v.seller_name = c.name 
      ORDER BY v.name 
      LIMIT 2500
    `);
    
    res.json({
      success: true,
      data: vessels,
      count: vessels.length,
      message: `Retrieved ${vessels.length} authentic oil vessels from MySQL`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all authentic refineries (111 global refineries)
app.get('/api/refineries', async (req, res) => {
  try {
    const refineries = await executeQuery(`
      SELECT * FROM refineries 
      WHERE status = 'active' 
      ORDER BY country, name
    `);
    
    res.json({
      success: true,
      data: refineries,
      count: refineries.length,
      message: `Retrieved ${refineries.length} global refineries from MySQL`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all authentic ports (29 oil terminals)
app.get('/api/ports', async (req, res) => {
  try {
    const ports = await executeQuery(`
      SELECT * FROM ports 
      WHERE status = 'active' 
      ORDER BY country, name
    `);
    
    res.json({
      success: true,
      data: ports,
      count: ports.length,
      message: `Retrieved ${ports.length} authentic oil terminals from MySQL`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all authentic companies (40 oil shipping companies)
app.get('/api/companies', async (req, res) => {
  try {
    const companies = await executeQuery(`
      SELECT * FROM companies 
      ORDER BY name
    `);
    
    res.json({
      success: true,
      data: companies,
      count: companies.length,
      message: `Retrieved ${companies.length} oil shipping companies from MySQL`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get vessel documents (172 authentic documents)
app.get('/api/vessels/:id/documents', async (req, res) => {
  try {
    const { id } = req.params;
    const documents = await executeQuery(`
      SELECT * FROM documents 
      WHERE vessel_id = ? 
      ORDER BY created_at DESC
    `, [id]);
    
    res.json({
      success: true,
      data: documents,
      count: documents.length,
      message: `Retrieved ${documents.length} documents for vessel from MySQL`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get dashboard statistics
app.get('/api/stats', async (req, res) => {
  try {
    const [vessels] = await executeQuery('SELECT COUNT(*) as count FROM vessels');
    const [refineries] = await executeQuery('SELECT COUNT(*) as count FROM refineries');
    const [ports] = await executeQuery('SELECT COUNT(*) as count FROM ports');
    const [documents] = await executeQuery('SELECT COUNT(*) as count FROM documents');
    const [companies] = await executeQuery('SELECT COUNT(*) as count FROM companies');
    
    const stats = {
      totalVessels: vessels.count,
      totalRefineries: refineries.count,
      totalPorts: ports.count,
      totalDocuments: documents.count,
      totalCompanies: companies.count
    };
    
    res.json({
      success: true,
      data: stats,
      message: 'MySQL database statistics retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// User authentication with MySQL
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user exists
    const existingUsers = await executeQuery('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    
    // Create user in MySQL
    await executeQuery(`
      INSERT INTO users (username, email, password, display_name, created_at) 
      VALUES (?, ?, ?, ?, NOW())
    `, [username, email, password, username]);
    
    // Get created user
    const [newUser] = await executeQuery('SELECT * FROM users WHERE email = ?', [email]);
    
    req.session.user = { id: newUser.id, email: newUser.email, username: newUser.username };
    
    res.json({
      success: true,
      user: { id: newUser.id, email: newUser.email, username: newUser.username },
      message: 'Registration successful with MySQL'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const users = await executeQuery('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    
    const user = users[0];
    if (user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }
    
    req.session.user = { id: user.id, email: user.email, username: user.username };
    
    res.json({
      success: true,
      user: { id: user.id, email: user.email, username: user.username },
      message: 'Login successful with MySQL'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Logout failed' });
    }
    res.json({ success: true, message: 'Logout successful' });
  });
});

app.get('/api/auth/me', (req, res) => {
  if (req.session.user) {
    res.json({ success: true, user: req.session.user });
  } else {
    res.status(401).json({ success: false, message: 'Not authenticated' });
  }
});

// Serve frontend
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
async function startServer() {
  const mysqlConnected = await initializeMySQL();
  
  if (!mysqlConnected) {
    console.error('❌ Failed to connect to MySQL. Server not starting.');
    process.exit(1);
  }
  
  app.listen(PORT, () => {
    console.log('🚢 ========================================');
    console.log('🚢 Oil Vessel Tracking - MySQL Only');
    console.log('🚢 Maritime Oil Brokerage Platform');
    console.log('🚢 ========================================');
    console.log(`🌐 Server: http://localhost:${PORT}`);
    console.log(`🗄️  Database: MySQL (${mysqlConfig.host})`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('');
    console.log('✅ Authentic maritime data available:');
    console.log('   • 2,500+ oil vessels from MySQL');
    console.log('   • 111 global refineries from MySQL');
    console.log('   • 29 authentic oil terminals from MySQL');
    console.log('   • 172 vessel documents from MySQL');
    console.log('   • 40 oil shipping companies from MySQL');
    console.log('');
    console.log('🚢 All PostgreSQL connections removed!');
    console.log('🚢 Pure MySQL implementation ready!');
    console.log('🚢 ========================================');
  });
}

startServer();