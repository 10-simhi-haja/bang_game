import { createResponse } from '../packet/response/createResponse.js';
import config from '../../config/config.js';

const {
  packet: { packetType: PACKET_TYPE },
  winType: WIN_TYPE,
  role: { roleType: ROLE_TYPE },
  character: { characterStateType: CHARACTER_STATE_TYPE },
  interval: INTERVAL,
  intervalType: INTERVAL_TYPE,
} = config;

const updateNotification = (game, user) => {
  try {
    if (!game) {
      throw new Error('해당 유저의 게임 세션이 존재하지 않습니다.');
    }

    // 유저 데이터 변환
    const userData = game.getAllUserDatas();

    const notiData = {
      user: userData,
    };

    const notificationResponse = createResponse(
      PACKET_TYPE.USER_UPDATE_NOTIFICATION,
      user.socket.sequence,
      notiData,
    );
    user.socket.write(notificationResponse);
  } catch (error) {
    new Error(error);
  }
};

export default updateNotification;
