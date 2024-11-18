import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dbPool from '../database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createSchemas = async () => {
    const sqlDir = path.join(__dirname, '../sql');
    try {
        const sql = fs.readFileSync(sqlDir + '/user_db.sql', 'utf8');
        const queries = sql
            .split(';')
            .map((query) => query.trim())
            .filter((query) => query.length > 0);

        for (const query of queries) {
            await dbPool.query(query);
        }

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
