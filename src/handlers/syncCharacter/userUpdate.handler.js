import { getGameSessionBySocket } from '../../sessions/game.session.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';
import { PACKET_TYPE } from '../../constants/header.js';

const packetType = PACKET_TYPE;

// 유저 업데이트 알림 전송 함수
const sendUserUpdateNotification = (gameSession, payload) => {
  const userUpdatePayload = {
    // 업데이트 된 유저의 정보를 담음
    users: payload.users.map((user) => ({
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
    })),
  };

  gameSession.users.forEach((user) => {
    const userUpdateNotification = createResponse(
      packetType.USER_UPDATE_NOTIFICATION,
      user.socket.sequence,
      userUpdatePayload,
    );
    user.socket.write(userUpdateNotification);
  });
};

// 유저 업데이트 요청 핸들러
const handleUserUpdate = async (socket, payload) => {
  try {
    const { users } = payload;

    const gameSession = getGameSessionBySocket(socket);
    if (!gameSession) {
      throw new Error('해당 유저의 게임 세션이 존재하지 않습니다.');
    }

    // 모든 유저에게 유저 업데이트 알림 전송
    sendUserUpdateNotification(gameSession, { users });
  } catch (error) {
    console.error('유저 업데이트 중 에러 발생:', error.message);
  }
};

export default handleUserUpdate;
