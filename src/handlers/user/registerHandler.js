import bcrypt from 'bcrypt';
import { createUser, findUser } from '../../database/user/user.db.js';
import { createResponse } from './../../utils/packet/response/createResponse.js';
import config from '../../config/config.js';

const registerHandler = async ({ socket, payload }) => {
  const { email, nickname, password } = payload;
  const responseData = {};

  const hashedPassword = await bcrypt.hash(password, 10);

  let user = await findUser(nickname, email);
  console.log(user);
  if (user === undefined) {
    console.log('회원가입 성공');
    createUser(nickname, email, hashedPassword);
    responseData.success = true;
    responseData.message = '회원가입 성공';
    responseData.failCode = 0;
  } else {
    console.log('회원가입 실패');
    responseData.success = false;
    responseData.message = '이미 존재하는 사용자';
    responseData.failCode = 1;
  }

  const registerResponsePacket = createResponse(
    config.packet.packetType.REGISTER_RESPONSE,
    socket.sequence,
    responseData,
  );

  socket.write(registerResponsePacket);
};

export default registerHandler;
