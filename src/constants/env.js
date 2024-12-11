import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 5555;
export const HOST = process.env.HOST || '127.0.0.1';
export const CLIENT_VERSION = process.env.CLIENT_VERSION || '1.0.0';

export const DB_NAME = process.env.DB_NAME || 'database1';
export const DB_USER = process.env.DB_USER || 'user1';
export const DB_PASSWORD = process.env.DB_PASSWORD || 'password1';
export const DB_HOST = process.env.DB_HOST || 'localhost';
export const DB_PORT = process.env.DB_PORT || 3306;

export const DB_NAME2 = process.env.DB_NAME2 || 'database1';
export const DB_USER2 = process.env.DB_USER2 || 'user1';
export const DB_PASSWORD2 = process.env.DB_PASSWORD2 || 'password1';
export const DB_HOST2 = process.env.DB_HOST2 || 'localhost';
export const DB_PORT2 = process.env.DB_PORT2 || 3306;

export const REDIS_NAME = process.env.REDIS_NAME || 'redis2';
export const REDIS_USER = process.env.REDIS_USER || 'user2';
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD || 'password2';
export const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
export const REDIS_PORT = process.env.REDIS_PORT || 15261;

export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'secretkey';

export const REDIS_NAME = process.env.REDIS_NAME || 'database1';
export const REDIS_USER = process.env.REDIS_USER || 'user1';
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD || 'password1';
export const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
export const REDIS_PORT = process.env.REDIS_PORT || 3306;
