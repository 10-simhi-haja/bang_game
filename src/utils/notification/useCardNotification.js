import config from '../../config/config.js';
import handleError from '../errors/errorHandler.js';
import { createResponse } from '../packet/response/createResponse.js';

const useCardNotification = (socket, userId, room, payload) => {
  try {
    const { cardType, targetUserId } = payload;

    const responseData = {
      cardType,
      userId,
      targetUserId,
    };

    const responsePayload = createResponse(
      config.packet.packetType.USE_CARD_NOTIFICATION,
      socket.sequence,
      responseData,
    );

    // 다른 사람에게 알림
    Object.entries(room.users).forEach(([key, userData]) => {
      const userSocket = userData.user.socket;
      if (userSocket) {
        userSocket.write(responsePayload);
      }
    });
  } catch (err) {
    handleError(socket, err);
  }
};

export default useCardNotification;
