import config from '../../config/config.js';
import { createResponse } from '../packet/response/createResponse.js';

const cardEffectNotification = (socket, userId, room, cardType) => {
  try {
    const responseData = {
      cardType: cardType,
      userId: userId,
      success: 0,
    };

    const cardEffectNotification = createResponse(
      config.packet.packetType.CARD_EFFECT_NOTIFICATION,
      socket.sequence,
      responseData,
    );

    room.getAllUsers().forEach((user) => {
      user.socket.write(cardEffectNotification);
    });
  } catch (error) {
    console.error(error);
  }
};

export default cardEffectNotification;
