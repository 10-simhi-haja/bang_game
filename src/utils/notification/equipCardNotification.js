import config from '../../config/config.js';
import handleError from '../errors/errorHandler.js';
import { createResponse } from '../packet/response/createResponse.js';

// 방에 남은 유저들에게 전달
const equipNotification = (socket, userId, room, cardType) => {
  // 응답 패킷 생성
  try {
    console.log('========장비 알림======');
    const notificationData = {
      cardType: cardType,
      userId: userId,
    };

    const equipNotification = createResponse(
      config.packet.packetType.EQUIP_CARD_NOTIFICATION,
      socket.sequence,
      notificationData,
    );

    // 게임에 참가한 모든 유저에게 알림
    room.getAllUsers().forEach((user) => {
      user.socket.write(equipNotification);
    });
  } catch (err) {
    handleError(socket, err);
  }
};

export default equipNotification;
