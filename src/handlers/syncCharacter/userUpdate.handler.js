import { getGameSessionBySocket } from '../../sessions/game.session.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';
import config from '../../config/config.js';
import { getUserBySocket } from '../../sessions/user.session.js';
import handleError from '../../utils/errors/errorHandler.js';

const packetType = config.packet.packetType;

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
    const userDataArray = users.map((user) => ({
      id: user.id,
      nickname: user.nickname,
      character: {
        characterType: user.character.characterType,
        roleType: user.character.roleType,
        hp: user.character.hp,
        weapon: user.character.weapon,
        stateInfo: user.character.stateInfo,
        equips: user.character.equips,
        debuffs: user.character.debuffs,
        handCards: user.character.handCards,
        bbangCount: user.character.bbangCount,
        handCardsCount: user.character.handCardsCount,
      },
    }));

    console.log('User Update Notification Data:', { user: userDataArray });

    const notiData = {
      user: userDataArray,
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
