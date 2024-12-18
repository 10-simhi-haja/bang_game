module.exports = {
  apps: [
    {
      name: 'app',
      script: 'src/server.js',
      instances: 2,
      exec_mode: 'cluster',
    },
  ],
};

// pm2 restart src/server.js || pm2 start src/server.js
