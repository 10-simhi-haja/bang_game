import config from '../../config/config.js';
import handleError from '../errors/errorHandler.js';
import { createResponse } from '../packet/response/createResponse.js';

const {
  packet: { packetType: PACKET_TYPE },
  card: { cardType: CARD_TYPE },
  globalFailCode: { globalFailCode: GLOBAL_FAIL_CODE },
} = config;

const useCardNotification = (socket, userId, room, payload) => {
  try {
    const { cardType, targetUserId } = payload;
    console.log('useCardNotification: cardType: ', cardType);
    console.log('useCardNotification: userId: ', userId.toString());
    console.log('useCardNotification: targetUserId: ', targetUserId.toString());

    const responseData = {
      cardType,
      userId,
      targetUserId,
    };

    const responsePayload = createResponse(
      PACKET_TYPE.USE_CARD_NOTIFICATION,
      socket.sequence,
      responseData,
    );
    const users = room.getAllUserDatas(userId);
    // console.log('게임 내 유저들', JSON.stringify(users, null, 2));

    // 다른 사람에게 알림
    room.getAllUsers().forEach((user) => {
      user.socket.write(responsePayload);
    });
  } catch (err) {
    handleError(socket, err);
  }
};

export default useCardNotification;
