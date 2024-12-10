import mysql from 'mysql2/promise';
import config from '../config/config.js';

const createPool = (dbConfig) => {
  const pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  const originalQuery = pool.query;
  pool.query = (sql, params) => {
    // 쿼리 실행 시 로그
    // console.log(`Executing query: ${sql} ${params ? `, ${JSON.stringify(params)}` : ``}`);

    return originalQuery.call(pool, sql, params);
  };

  return pool;
};

const dbPool = {
  UESR_DB: createPool(config.databases.UESR_DB),
  GAME_DB: createPool(config.databases.GAME_DB),
};

export default dbPool;
