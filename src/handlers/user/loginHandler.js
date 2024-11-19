import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { findUserEmail, updateUserLogin } from '../../database/user/user.db.js';
import CustomError from '../../utils/errors/customError.js';
import ErrorCodes from '../../utils/errors/errorCodes.js';
import handleError from './../../utils/errors/errorHandler.js';
import config from '../../config/config.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';

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

    // 유저 세션에 추가

    // JWT 토큰 생성
    const userJWT = jwt.sign(user, config.jwt.key);
    socket.token = userJWT;

    // 마지막 접속 기록 업데이트
    updateUserLogin(email);

    // 응답 패킷 생성
    const responseData = {
      success: true,
      message: '로그인 성공',
      token: userJWT,
      myInfo: { id: user.account_id, nicname: user.nicname, character: {} },
      failCode: 0,
    };

    const loginResponsePacket = createResponse(
      config.packet.packetType.LOGIN_RESPONSE,
      socket.sequence,
      responseData,
    );

    socket.write(loginResponsePacket);
  } catch (error) {
    handleError(socket, error);
  }
};

export default loginHandler;
