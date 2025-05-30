/**
 * Direct MySQL Connection for Oil Vessel Tracking Application
 * Simple and reliable connection to your authentic maritime data
 */

import mysql from 'mysql2/promise';

// Your MySQL database credentials
const mysqlConfig = {
  host: 'sql301.infinityfree.com',
  user: 'u150634185_A99wL',
  password: 'jonny@2025@',
  database: 'u150634185_oiltrak',
  port: 3306,
  ssl: false,
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000
};

// Create connection pool for better performance
let connectionPool = null;

export async function getDirectMySQLConnection() {
  try {
    if (!connectionPool) {
      connectionPool = mysql.createPool(mysqlConfig);
      console.log('✅ Direct MySQL connection pool created');
    }
    return connectionPool;
  } catch (error) {
    console.error('❌ MySQL connection failed:', error);
    throw error;
  }
}

// Simple query function for your authentic data
export async function executeQuery(sql, params = []) {
  try {
    const connection = await getDirectMySQLConnection();
    const [rows] = await connection.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

// Get all your authentic vessels
export async function getAllVessels() {
  const sql = `
    SELECT v.*, c.name as company_name 
    FROM vessels v 
    LEFT JOIN companies c ON v.seller_name = c.name 
    ORDER BY v.name 
    LIMIT 2500
  `;
  return await executeQuery(sql);
}

// Get all your authentic refineries
export async function getAllRefineries() {
  const sql = `
    SELECT * FROM refineries 
    WHERE status = 'active' 
    ORDER BY country, name
  `;
  return await executeQuery(sql);
}

// Get all your authentic ports
export async function getAllPorts() {
  const sql = `
    SELECT * FROM ports 
    WHERE status = 'active' 
    ORDER BY country, name
  `;
  return await executeQuery(sql);
}

// Get all your authentic companies
export async function getAllCompanies() {
  const sql = `
    SELECT * FROM companies 
    ORDER BY name
  `;
  return await executeQuery(sql);
}

// Get vessel documents
export async function getVesselDocuments(vesselId) {
  const sql = `
    SELECT * FROM documents 
    WHERE vessel_id = ? 
    ORDER BY created_at DESC
  `;
  return await executeQuery(sql, [vesselId]);
}

// User authentication
export async function getUserByEmail(email) {
  const sql = `
    SELECT * FROM users 
    WHERE email = ? 
    LIMIT 1
  `;
  const results = await executeQuery(sql, [email]);
  return results[0] || null;
}

export async function createUser(userData) {
  const sql = `
    INSERT INTO users (username, email, password, display_name, created_at) 
    VALUES (?, ?, ?, ?, NOW())
  `;
  const params = [
    userData.username,
    userData.email,
    userData.password,
    userData.displayName || userData.username
  ];
  await executeQuery(sql, params);
  return await getUserByEmail(userData.email);
}

// Statistics for your authentic data
export async function getDashboardStats() {
  const [vessels] = await executeQuery('SELECT COUNT(*) as count FROM vessels');
  const [refineries] = await executeQuery('SELECT COUNT(*) as count FROM refineries');
  const [ports] = await executeQuery('SELECT COUNT(*) as count FROM ports');
  const [documents] = await executeQuery('SELECT COUNT(*) as count FROM documents');
  
  return {
    totalVessels: vessels.count,
    totalRefineries: refineries.count,
    totalPorts: ports.count,
    totalDocuments: documents.count
  };
}

// Test connection
export async function testConnection() {
  try {
    const connection = await getDirectMySQLConnection();
    const [result] = await connection.execute('SELECT 1 as test');
    console.log('✅ MySQL connection test successful');
    return true;
  } catch (error) {
    console.error('❌ MySQL connection test failed:', error);
    return false;
  }
}