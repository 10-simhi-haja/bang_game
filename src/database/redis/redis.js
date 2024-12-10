import Redis from 'ioredis';
import config from '../../config/config.js';

const redis = new Redis({
  host: config.databases.REDIS.host,
  port: config.databases.REDIS.port,
  password: config.databases.REDIS.password,
});

redis.on('connect', () => {
  console.log('Connected to Redis Cloud');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

export default redis;
