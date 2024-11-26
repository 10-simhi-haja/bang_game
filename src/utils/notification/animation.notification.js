import { getGameSessionBySocket } from '../../sessions/game.session.js';
import { createResponse } from '../packet/response/createResponse.js';
import { getUserBySocket } from '../../sessions/user.session.js';
import handleError from '../../utils/errors/errorHandler.js';
import { PACKET_TYPE } from '../../constants/header.js';

const packetType = PACKET_TYPE;

const handleAnimationNotification = async ({ socket, payload }) => {
  try {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Payload가 올바르지 않습니다.');
    }

    const { userId, animationType } = payload;

    if (typeof userId === 'undefined' || typeof animationType === 'undefined') {
      throw new Error('페이로드에 userId 또는 animationType 값이 없습니다.');
    }

    const gameSession = getGameSessionBySocket(socket);

    if (!gameSession) {
      throw new Error('해당 유저의 게임 세션이 존재하지 않습니다.');
    }

    const currentUser = getUserBySocket(socket);

    if (!currentUser) {
      throw new Error('유저가 존재하지 않습니다.');
    }

    const animationResponseData = {
      userId,
      animationType,
    };

    console.log('Animation Notification Response Data:', animationResponseData);

    const animationResponse = createResponse(
      packetType.ANIMATION_NOTIFICATION,
      socket.sequence,
      animationResponseData,
    );

    // 현재 게임 세션의 모든 사용자에게 애니메이션 노티피케이션 전송
    const allUser = gameSession.getAllUsers();
    allUser.forEach((notiUser) => {
      notiUser.socket.write(animationResponse);
    });
  } catch (error) {
    handleError(socket, error);
  }
};

export default handleAnimationNotification;
