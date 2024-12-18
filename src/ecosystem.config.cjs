module.exports = {
  apps: [
    {
      name: 'app',
      script: 'src/server.js',
      instances: 2, // 클러스터 모드 인스턴스 수
      exec_mode: 'cluster', // 클러스터 모드 활성화
      env: {
        BASE_PORT: 5556, // 기본 시작 포트
      },
    },
  ],
};

// pm2 restart src/server.js || pm2 start src/server.js
