// USER_DB 쿼리문 모임 스크립트
const USER_SQL_QUERIES = {
  FIND_USER: `SELECT * FROM user WHERE nicname = ? OR email = ?`,
  FIND_USER_NICNAME: `SELECT * FROM user WHERE nicname = ?`,
  FIND_USER_EMAIL: `SELECT * FROM user WHERE email = ?`,
  CREATE_USER: `INSERT INTO user (nicname, email, password) VALUES (?, ?, ?)`,
  UPDATE_USER_LOGIN: `UPDATE user SET update_at = CURRENT_TIMESTAMP WHERE email = ?`,
};

export default USER_SQL_QUERIES;
