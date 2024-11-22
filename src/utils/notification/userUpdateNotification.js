import { getGameSessionBySocket } from '../../sessions/game.session.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';
import config from '../../config/config.js';
import { getUserBySocket } from '../../sessions/user.session.js';
import handleError from '../../utils/errors/errorHandler.js';

const packetType = config.packet.packetType;

// message S2CUserUpdateNotification {
//   repeated UserData user = 1;
// }

// message UserData {
//   int64 id = 1;
//   string nickname = 2;
//   CharacterData character = 3;
// }

// 전체 유저에게 일정 주기마다 전송
const userUpdateNotification = (game) => {
  try {
    if (!game) {
      throw new Error('해당 유저의 게임 세션이 존재하지 않습니다.');
    }

    // 유저 데이터 변환
    const userData = game.getAllUserDatas();

    const notiData = {
      user: userData,
    };

    const allUser = game.getAllUsers();
    let socket = null;

    allUser.forEach((notiUser) => {
      socket = notiUser.socket;
      const notificationResponse = createResponse(
        packetType.USER_UPDATE_NOTIFICATION,
        socket.sequence,
        notiData,
      );
      notiUser.socket.write(notificationResponse);
    });
  } catch (error) {
    handleError(socket, error);
  }
};

export default userUpdateNotification;
