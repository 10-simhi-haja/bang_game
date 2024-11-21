import config from '../../config/config.js';
import handleError from '../errors/errorHandler.js';
import { createResponse } from '../packet/response/createResponse.js';

const useCardNotification = (socket, userId, room, payload) => {
  try {
    console.log('그냥 useCard');
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
