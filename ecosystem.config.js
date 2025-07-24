module.exports = {
  apps: [{
    name: 'petrodealhub',
    script: 'server/index.js',
    instances: 'max', // Use all available CPU cores
    exec_mode: 'cluster',
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s',
    env: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    log_file: '/var/log/pm2/petrodealhub.log',
    error_file: '/var/log/pm2/petrodealhub-error.log',
    out_file: '/var/log/pm2/petrodealhub-out.log',
    time: true,
    autorestart: true,
    watch: false,
    ignore_watch: ['node_modules', 'logs', '.git'],
    // Health monitoring
    health_check_url: 'http://localhost:5000/api/health',
    health_check_grace_period: 3000
  }]
};