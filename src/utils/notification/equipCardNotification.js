import config from '../../config/config.js';
import handleError from '../errors/errorHandler.js';
import { createResponse } from '../packet/response/createResponse.js';

// 방에 남은 유저들에게 전달
const equipNotification = (socket, userId, room, cardType) => {
  // 응답 패킷 생성
  try {
    console.log('========장비 알림======');
    const notificationData = {
      cardType,
      userId,
    };
    const equipNotification = createResponse(
      config.packet.packetType.EQUIP_CARD_NOTIFICATION,
      socket.sequence,
      notificationData,
    );

    Object.entries(room.users).forEach(([key, userData]) => {
      const userSocket = userData.user.socket;
      if (userSocket) {
        userSocket.write(equipNotification);
      }
    });
  } catch (err) {
    handleError(socket, err);
  }
};

export default equipNotification;
