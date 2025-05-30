// Simple start script for Hostinger hosting
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Oil Vessel Tracking Platform...');

// Start the server
const server = spawn('node', ['server/index.js'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: process.env.PORT || 5000
  }
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

process.on('SIGINT', () => {
  console.log('Shutting down...');
  server.kill('SIGINT');
});