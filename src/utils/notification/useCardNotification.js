import config from '../../config/config.js';
import handleError from '../errors/errorHandler.js';
import { createResponse } from '../packet/response/createResponse.js';

const useCardNotification = (socket, userId, room, payload) => {
  try {
    const { cardType, targetUserId } = payload;
    const targeId = targetUserId.low;
    console.log('targetUserId: ', targetUserId.low);

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
    const users = room.getAllUserDatas(userId);
    console.log('게임 내 유저들', JSON.stringify(users, null, 2));

    // 다른 사람에게 알림
    room.getAllUsers().forEach((user) => {
      user.socket.write(responsePayload);
    });
  } catch (err) {
    handleError(socket, err);
  }
};

export default useCardNotification;
