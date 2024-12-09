import bcrypt from 'bcrypt';
import { findUserEmail, updateUserLogin } from '../../database/user/user.db.js';
import CustomError from '../../utils/errors/customError.js';
import ErrorCodes from '../../utils/errors/errorCodes.js';
import handleError from './../../utils/errors/errorHandler.js';
import config from '../../config/config.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';
import { addUser, getUserById } from '../../sessions/user.session.js';
import { createJWT } from '../../utils/jwt/createToken.js';
import { loadSpawnPoint } from '../../database/character/spawnPoint.queries.js';

const loginHandler = async ({ socket, payload }) => {
  try {
    const { email, password } = payload;

    const user = await findUserEmail(email);
    const test = await loadSpawnPoint();
    console.log(test);

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
    let isUserSession = getUserById(user.account_id);
    if (isUserSession) {
      throw new CustomError(
        ErrorCodes.DUPLICATED_USER_CONNECT,
        '해당 유저는 이미 존재한다.',
        socket.sequence,
      );
    }
    // JWT 토큰 생성
    // const token = jwt.sign(user, config.jwt.key);
    const token = createJWT(email);

    await addUser(socket, user.account_id, user.nickname);

    socket.account_id = user.account_id;
    // 마지막 접속 기록 업데이트
    updateUserLogin(email);

    // 응답 패킷 생성
    const responseData = {
      success: true,
      message: '로그인 성공',
      token,
      myInfo: { id: user.account_id, nickname: user.nickname, character: {} },
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
