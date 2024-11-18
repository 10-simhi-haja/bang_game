import mysql from 'mysql2/promise';
import config from '../config/config.js';

const createPool = () => {
  const pool = mysql.createPool({
    user: config.databases.USER_DB.user,
    password: config.databases.USER_DB.password,
    database: config.databases.USER_DB.name, // 명시적으로 추가
    port: config.databases.USER_DB.port,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  const originalQuery = pool.query;
  pool.query = (sql, params) => {
    // 쿼리 실행 시 로그
    console.log(`Executing query: ${sql} ${params ? `, ${JSON.stringify(params)}` : ``}`);

    return originalQuery.call(pool, sql, params);
  };

  return pool;
};

const dbPool = createPool();

export default dbPool;
