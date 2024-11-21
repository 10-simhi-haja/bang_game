import { getGameSessionBySocket } from '../../sessions/game.session.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';
import { PACKET_TYPE } from '../../constants/header.js';

const packetType = PACKET_TYPE;

const handlePositionUpdate = async ({ socket, payload }) => {
  try {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Payload가 올바르지 않습니다.');
    }

    const { x, y } = payload;

    if (typeof x === 'undefined' || typeof y === 'undefined') {
      throw new Error('페이로드에 x 또는 y 값이 없습니다.');
    }

    const gameSession = getGameSessionBySocket(socket);

    if (!gameSession) {
      throw new Error('해당 유저의 게임 세션이 존재하지 않습니다.');
    }

    let currentUser, opponent;

    if (typeof gameSession.users === 'object') {
      currentUser = Object.values(gameSession.users)
        .map((entry) => entry.user)
        .find((user) => user.socket === socket);
      opponent = Object.values(gameSession.users)
        .map((entry) => entry.user)
        .find((user) => user.socket !== socket);
    }

    if (!currentUser) {
      throw new Error('유저가 존재하지 않습니다.');
    }

    if (!opponent) {
      throw new Error('상대 유저가 존재하지 않습니다.');
    }

    // 위치 업데이트 호출
    currentUser.setPos(x, y);

    // 현재 유저에게 응답 전송
    const positionResponseData = {
      success: true,
      failCode: 0,
    };

    const positionResponse = await createResponse(
      packetType.POSITION_UPDATE_RESPONSE,
      socket.sequence,
      positionResponseData,
    );

    socket.write(JSON.stringify(positionResponse));

    // 상대 유저에게 알림 전송
    const notificationData = {
      userId: currentUser.id,
      x,
      y,
      characterPositions: {
        [currentUser.id]: { x, y },
        [opponent.id]: { x: opponent.x, y: opponent.y },
      },
    };

    const notificationResponse = await createResponse(
      packetType.POSITION_UPDATE_NOTIFICATION,
      opponent.socket.sequence,
      notificationData,
    );

    opponent.socket.write(JSON.stringify(notificationResponse));
  } catch (error) {
    console.error('위치 업데이트 중 에러 발생:', error.message);

    const errorResponse = await createResponse(packetType.POSITION_UPDATE_RESPONSE, null, {
      success: false,
      message: error.message,
      failCode: 1,
    });

    try {
      socket.write(JSON.stringify(errorResponse));
    } catch (socketError) {
      console.error('Failed to send error response:', socketError.message);
    }
  }
};

export default handlePositionUpdate;
