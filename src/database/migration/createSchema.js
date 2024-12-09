import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dbPool from '../database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const readSqlFile = async (pool, filePath) => {
  const sql = fs.readFileSync(filePath, 'utf8');
  const queries = sql
    .split(';')
    .map((query) => query.trim())
    .filter((query) => query.length > 0);

  for (const query of queries) {
    await pool.query(query);
  }
};

const createSchemas = async () => {
  const sqlDir = path.join(__dirname, '../sql');
  try {
    await readSqlFile(dbPool.UESR_DB, sqlDir + '/user_db.sql');
    await readSqlFile(dbPool.GAME_DB, sqlDir + '/game_db.sql');
    console.log('DB 테이블이 성공적으로 생성 완료');
  } catch (error) {
    console.error('DB 마이그레이션 오류: ', error);
  }
};

createSchemas()
  .then(() => {
    console.log('마이그레이션 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('마이그레이션 중 오류 발생: ', error);
    process.exit(1);
  });
