import { createResponse } from '../packet/response/createResponse.js';
import config from '../../config/config.js';

const packetType = config.packet.packetType;

// 유저 업데이트 노티피케이션 함수
const userUpdateNotification = (game) => {
  try {
    if (!game) {
      throw new Error('해당 유저의 게임 세션이 존재하지 않습니다.');
    }

    // 유저 데이터 변환
    const userData = game.getAllUserDatas();

    // 유저 업데이트 부분.
    userData.forEach((user) => {
      user.character.handCardsCount = user.character.handCards.length;
    });

    const notiData = {
      user: userData,
    };

    const allUser = game.getAllUsers();

    allUser.forEach((notiUser) => {
      const notificationResponse = createResponse(
        packetType.USER_UPDATE_NOTIFICATION,
        notiUser.socket.sequence,
        notiData,
      );
      notiUser.socket.write(notificationResponse);
    });
  } catch (error) {
    new Error(error);
  }
};

export default userUpdateNotification;
