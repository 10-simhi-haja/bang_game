import config from '../../config/config.js';
import { createResponse } from '../packet/response/createResponse.js';

// 방에 남은 유저들에게 전달
const equipNotification = (socket, userId, cardType, user) => {
  // 응답 패킷 생성

  const notificationData = {
    cardType: cardType,
    userId: userId,
  };
  const equipNotification = createResponse(
    config.packet.packetType.EQUIP_CARD_NOTIFICATION,
    socket.sequence,
    notificationData,
  );
  console.log(user.socket);
  user.socket.write(equipNotification);
};

export default equipNotification;
