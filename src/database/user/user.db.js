import USER_SQL_QUERIES from './user.queries.js';
import dbPool from './../database.js';

export const findUser = async (nickname, email) => {
  try {
    const [rows] = await dbPool.UESR_DB.query(USER_SQL_QUERIES.FIND_USER, [nickname, email]);
    console.log(rows);
    return rows[0];
  } catch (error) {
    console.error('[SQL] findUser 오류: ', error);
  }
};

export const findUserNickname = async (nickname) => {
  try {
    const [rows] = await dbPool.UESR_DB.query(USER_SQL_QUERIES.FIND_USER_NICKNAME, [nickname]);
    return rows[0];
  } catch (error) {
    console.error('[SQL] findUserNickname 오류: ', error);
  }
};

export const findUserEmail = async (email) => {
  try {
    const [rows] = await dbPool.UESR_DB.query(USER_SQL_QUERIES.FIND_USER_EMAIL, [email]);
    return rows[0];
  } catch (error) {
    console.error('[SQL] findUserEmail 오류: ', error);
  }
};

export const createUser = async (nickname, email, password) => {
  try {
    await dbPool.UESR_DB.query(USER_SQL_QUERIES.CREATE_USER, [nickname, email, password]);
  } catch (error) {
    console.error('[SQL] createUser 오류: ', error);
  }
};

export const updateUserLogin = async (email) => {
  try {
    await dbPool.UESR_DB.query(USER_SQL_QUERIES.UPDATE_USER_LOGIN, [email]);
  } catch (error) {
    console.error('[SQL] updateUserLogin 오류: ', error);
  }
};
