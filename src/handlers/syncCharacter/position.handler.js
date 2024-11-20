import { getGameSessionBySocket } from '../../sessions/game.session.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';
import { PACKET_TYPE } from '../../constants/header.js';

const packetType = PACKET_TYPE;

// 유저 위치 업데이트 함수
const updateCharacterPosition = (gameSession, userId, x, y) => {
  const targetUser = gameSession.users.find((user) => user.id === userId);
  if (!targetUser) return false;

  targetUser.position = { x, y };
  return true;
};

// 위치 업데이트 요청 핸들러
const handlePositionUpdate = async (socket, payload) => {
  try {
    const { x, y } = payload;
    const gameSession = getGameSessionBySocket(socket);
    if (!gameSession) {
      throw new Error('해당 유저의 게임 세션이 존재하지 않습니다.');
    }

    const currentUser = gameSession.users.find((user) => user.socket === socket);
    if (!currentUser) {
      throw new Error('유저가 존재하지 않습니다.');
    }

    const opponent = gameSession.users.find((user) => user.socket !== socket);
    if (!opponent) {
      throw new Error('상대 유저가 존재하지 않습니다.');
    }

    // 위치 업데이트 호출
    const success = updateCharacterPosition(gameSession, currentUser.id, x, y);

    if (success) {
      const positionResponseData = {
        success: true,
        failCode: 0,
      };

      // 현재 유저에게 응답 전송
      const positionResponse = await createResponse(
        packetType.POSITION_UPDATE_RESPONSE,
        socket.sequence,
        positionResponseData,
      );
      socket.write(positionResponse);

      // 상대 유저에게 알림 전송
      const notificationData = {
        userId: currentUser.id,
        x,
        y,
      };

      const notificationResponse = await createResponse(
        packetType.POSITION_UPDATE_NOTIFICATION,
        opponent.socket.sequence,
        notificationData,
      );
      opponent.socket.write(notificationResponse);
    } else {
      throw new Error('캐릭터 위치 업데이트에 실패하였습니다.');
    }
  } catch (error) {
    console.error('위치 업데이트 중 에러 발생:', error.message);

    const errorResponse = createResponse(packetType.POSITION_UPDATE_RESPONSE, null, {
      success: false,
      message: 'Error updating position',
      failCode: 1,
    });
    socket.write(errorResponse);
  }
};

export default handlePositionUpdate;
