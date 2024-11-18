import USER_SQL_QUERIES from './user.queries.js';
import dbPool from './../database.js';

export const findUser = async (nicname, email) => {
  try {
    const [rows] = await dbPool.query(USER_SQL_QUERIES.FIND_USER, [nicname, email]);
    console.log(rows);
    return rows[0];
  } catch (error) {
    console.error('[SQL] findUser 오류: ', error);
  }
};

export const findUserNicname = async (nicname) => {
  try {
    const [rows] = await dbPool.query(USER_SQL_QUERIES.FIND_USER_NICNAME, [nicname]);
    return rows[0];
  } catch (error) {
    console.error('[SQL] findUserNicname 오류: ', error);
  }
};

export const findUserEmail = async (email) => {
  try {
    const [rows] = await dbPool.query(USER_SQL_QUERIES.FIND_USER_EMAIL, [email]);
    return rows[0];
  } catch (error) {
    console.error('[SQL] findUserEmail 오류: ', error);
  }
};

export const createUser = async (nicname, email, password) => {
  try {
    await dbPool.query(USER_SQL_QUERIES.CREATE_USER, [nicname, email, password]);
  } catch (error) {
    console.error('[SQL] createUser 오류: ', error);
  }
};

export const updateUserLogin = async (email) => {
  try {
    await dbPool.query(USER_SQL_QUERIES.UPDATE_USER_LOGIN, [email]);
  } catch (error) {
    console.error('[SQL] updateUserLogin 오류: ', error);
  }
};
