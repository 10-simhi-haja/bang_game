import Redis from 'ioredis';
import config from '../../config/config.js';

class RedisManager {
  constructor() {
    if (!RedisManager.instance) {
      this.redisClient = new Redis({
        host: config.databases.REDIS_DB.host,
        port: config.databases.REDIS_DB.port,
        password: config.databases.REDIS_DB.password,
      });

      this.redisClient.on('connect', () => console.log('Redis 연결 성공?'));
      this.redisClient.on('error', (error) => console.error('Redis 연결 실패:', error));

      RedisManager.instance = this;
    }

    return RedisManager.instance;
  }

  getClient() {
    return this.redisClient;
  }
}

const redisManager = new RedisManager();

export default redisManager;
