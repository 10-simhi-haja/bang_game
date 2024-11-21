import config from '../../config/config.js';
import { createResponse } from '../packet/response/createResponse.js';

const cardEffectNotification = (socket) => {
  console.log('이것은 카드 효과 노티 뼈대이다.');

  const responseData = {
    cardType: 0,
    userId: 0,
    success: 0,
  };

  const cardEffectNotification = createResponse(
    config.packet.packetType.CARD_EFFECT_NOTIFICATION,
    socket.sequence,
    responseData,
  );
};

export default cardEffectNotification;

// message S2CCardEffectNotification {
//     CardType cardType = 1;
//     int64  userId = 2;
//     bool success = 3;
//     }
