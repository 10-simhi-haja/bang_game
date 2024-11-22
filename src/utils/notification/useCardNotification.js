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
    const character = room.getCharacter(userId);
    console.log('유저 캐릭터', character);
    // 다른 사람에게 알림
    room.getAllUsers().forEach((user) => {
      user.socket.write(responsePayload);
    });
  } catch (err) {
    handleError(socket, err);
  }
};

export default useCardNotification;
