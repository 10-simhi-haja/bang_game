import bcrypt from 'bcrypt';
import { findUserEmail } from '../../database/user/user.db.js';
import CustomError from '../../utils/errors/customError.js';
import ErrorCodes from '../../utils/errors/errorCodes.js';
import handleError from './../../utils/errors/errorHandler.js';

const loginHandler = async ({ socket, payload }) => {
  try {
    const { email, password } = payload;

    const user = await findUserEmail(email);
    // DB 유저 확인
    if (!user) {
      throw new CustomError(
        ErrorCodes.USER_NOT_FOUND,
        '해당 유저는 가입되어 있지 않다.',
        socket.sequence,
      );
    }

    // 비밀번호 확인
    if (!(await bcrypt.compare(password, user.password))) {
      throw new CustomError(
        ErrorCodes.USER_NOT_FOUND,
        '비밀번호가 일치하지 않다.',
        socket.sequence,
      );
    }

    // 동일한 유저가 접속 중인지 확인

    // JWT 토큰 생성
    console.log(user);
  } catch (error) {
    handleError(socket, error);
  }
};

export default loginHandler;
