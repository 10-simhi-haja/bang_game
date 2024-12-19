import CARD_SQL_QUERIES from './card.queries.js';
import dbPool from '../database.js';

export const loadCardType = async () => {
  try {
    const [rows] = await dbPool.GAME_DB.query(CARD_SQL_QUERIES.LOAD_CARD_TYPE);
    return rows;
  } catch (error) {
    console.error('[SQL] loadCardType 오류: ', error);
  }
};
