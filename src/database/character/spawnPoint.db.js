import SPAWN_POINT_SQL_QUERIES from './spawnPoint.queries.js';
import dbPool from '../database.js';

export const loadSpawnPoint = async () => {
  try {
    const [rows] = await dbPool.GAME_DB.query(SPAWN_POINT_SQL_QUERIES.LOAD_SPAWN_POINT);
    return rows;
  } catch (error) {
    console.error('[SQL] loadSpawnPoint 오류: ', error);
  }
};