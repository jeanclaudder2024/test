/**
 * Simple Express Routes - Direct MySQL Connection
 * Oil Vessel Tracking Application with Authentic Maritime Data
 */

import express from 'express';
import {
  getAllVessels,
  getAllRefineries,
  getAllPorts,
  getAllCompanies,
  getVesselDocuments,
  getDashboardStats,
  getUserByEmail,
  createUser,
  testConnection
} from './simple-mysql-connection.js';

const router = express.Router();

// Test database connection
router.get('/api/test-connection', async (req, res) => {
  try {
    const isConnected = await testConnection();
    res.json({ 
      success: isConnected, 
      message: isConnected ? 'MySQL connection successful' : 'MySQL connection failed'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all authentic vessels (2,500+ records)
router.get('/api/vessels', async (req, res) => {
  try {
    const vessels = await getAllVessels();
    res.json({
      success: true,
      data: vessels,
      count: vessels.length,
      message: `Retrieved ${vessels.length} authentic oil vessels`
    });
  } catch (error) {
    console.error('Error fetching vessels:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all authentic refineries (111 global refineries)
router.get('/api/refineries', async (req, res) => {
  try {
    const refineries = await getAllRefineries();
    res.json({
      success: true,
      data: refineries,
      count: refineries.length,
      message: `Retrieved ${refineries.length} global refineries`
    });
  } catch (error) {
    console.error('Error fetching refineries:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all authentic ports (29 oil terminals)
router.get('/api/ports', async (req, res) => {
  try {
    const ports = await getAllPorts();
    res.json({
      success: true,
      data: ports,
      count: ports.length,
      message: `Retrieved ${ports.length} authentic oil terminals`
    });
  } catch (error) {
    console.error('Error fetching ports:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all authentic shipping companies (40 companies)
router.get('/api/companies', async (req, res) => {
  try {
    const companies = await getAllCompanies();
    res.json({
      success: true,
      data: companies,
      count: companies.length,
      message: `Retrieved ${companies.length} oil shipping companies`
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get vessel documents
router.get('/api/vessels/:id/documents', async (req, res) => {
  try {
    const { id } = req.params;
    const documents = await getVesselDocuments(id);
    res.json({
      success: true,
      data: documents,
      count: documents.length,
      message: `Retrieved ${documents.length} documents for vessel`
    });
  } catch (error) {
    console.error('Error fetching vessel documents:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get dashboard statistics
router.get('/api/stats', async (req, res) => {
  try {
    const stats = await getDashboardStats();
    res.json({
      success: true,
      data: stats,
      message: 'Dashboard statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// User authentication routes
router.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await getUserByEmail(email);
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    
    // Simple password check (in production, use proper hashing)
    if (user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }
    
    // Store user in session
    req.session.user = { id: user.id, email: user.email, username: user.username };
    
    res.json({
      success: true,
      user: { id: user.id, email: user.email, username: user.username },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    
    // Create new user
    const newUser = await createUser({ username, email, password });
    
    // Store user in session
    req.session.user = { id: newUser.id, email: newUser.email, username: newUser.username };
    
    res.json({
      success: true,
      user: { id: newUser.id, email: newUser.email, username: newUser.username },
      message: 'Registration successful'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Logout failed' });
    }
    res.json({ success: true, message: 'Logout successful' });
  });
});

// Get current user
router.get('/api/auth/me', (req, res) => {
  if (req.session.user) {
    res.json({ success: true, user: req.session.user });
  } else {
    res.status(401).json({ success: false, message: 'Not authenticated' });
  }
});

export default router;