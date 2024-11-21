import { getGameSessionBySocket } from '../../sessions/game.session.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';
import config from '../../config/config.js';
import { getUserBySocket } from '../../sessions/user.session.js';
import handleError from '../../utils/errors/errorHandler.js';

const packetType = config.packet.packetType;

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

    const currentUser = getUserBySocket(socket);

    if (!currentUser) {
      throw new Error('유저가 존재하지 않습니다.');
    }

    currentUser.setPos(x, y);

    const positionResponseData = {
      success: true,
      failCode: 0,
    };

    console.log('Position Update Response Data:', positionResponseData);

    const positionResponse = createResponse(
      packetType.POSITION_UPDATE_RESPONSE,
      socket.sequence,
      positionResponseData,
    );

    socket.write(positionResponse);

    /// 포지션 응답 완

    const characterPositions = [];
    const allUser = gameSession.getAllUsers();

    allUser.forEach((user, i) => {
      const posData = {
        id: user.id,
        x: user.x,
        y: user.y,
      };
      characterPositions.push(posData);
    });

    // 캐릭터 위치 데이터 생성
    // const characterPositions = Object.entries(gameSession.users).map(([userId, userEntry]) => ({
    //   id: parseInt(userId, 10),
    //   x: userEntry.user.x,
    //   y: userEntry.user.y,
    // }));

    console.log('Notification Response Data:', { characterPositions });

    const notiData = {
      characterPositions: characterPositions,
    };

    // 노티피케이션 생성 및 전송
    const notificationResponse = createResponse(
      packetType.POSITION_UPDATE_NOTIFICATION,
      socket.sequence,
      notiData,
    );

    //const opponents = gameSession.getOpponents(currentUser.id);
    allUser.forEach((notiUser) => {
      notiUser.socket.write(notificationResponse);
    });

    // Object.entries(gameSession.users).forEach(([key, userData]) => {
    //   const userSocket = userData.user.socket;
    //   if (userSocket && userSocket !== socket) {
    //     console.log(`Sending notification to user ${key}`);
    //     userSocket.write(notificationResponse);
    //   }
    // });
  } catch (error) {
    handleError(socket, error);

    // console.error('위치 업데이트 중 에러 발생:', error.message);

    // const errorResponse = createResponse(packetType.POSITION_UPDATE_RESPONSE, socket.sequence, {
    //   success: false,
    //   message: error.message,
    //   failCode: 1,
    // });

    // try {
    //   socket.write(errorResponse);
    // } catch (socketError) {
    //   console.error('에러 응답 전송 실패:', socketError.message);
    // }
  }
};

export default handlePositionUpdate;
