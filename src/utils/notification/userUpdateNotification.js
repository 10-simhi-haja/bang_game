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

const handleUserUpdateNotification = async ({ socket, payload }) => {
  try {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Payload가 올바르지 않습니다.');
    }

    const { users } = payload;

    if (!Array.isArray(users)) {
      throw new Error('페이로드에 유저 배열이 없습니다.');
    }

    const gameSession = getGameSessionBySocket(socket);

    if (!gameSession) {
      throw new Error('해당 유저의 게임 세션이 존재하지 않습니다.');
    }

    const currentUser = getUserBySocket(socket);

    if (!currentUser) {
      throw new Error('유저가 존재하지 않습니다.');
    }

    // 유저 데이터 변환
    const userData = gameSession.getAllUserDatas();

    const notiData = {
      user: userData,
    };

    // 노티피케이션 생성 및 전송
    const notificationResponse = createResponse(
      packetType.USER_UPDATE_NOTIFICATION,
      socket.sequence,
      notiData,
    );

    const allUser = gameSession.getAllUsers();
    allUser.forEach((notiUser) => {
      notiUser.socket.write(notificationResponse);
    });
  } catch (error) {
    handleError(socket, error);
  }
};

export default handleUserUpdateNotification;
