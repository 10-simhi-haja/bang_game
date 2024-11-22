import config from '../../config/config.js';
import { createResponse } from '../packet/response/createResponse.js';

const {
  packet: { packetType: PACKET_TYPE },
  winType: WIN_TYPE,
  role: { roleType: ROLE_TYPE },
} = config;

// 게임시작 알림
const gameEndNotification = (users, payload) => {
  users.forEach((notiUser) => {
    const noti = createResponse(
      PACKET_TYPE.GAME_END_NOTIFICATION,
      notiUser.socket.sequence,
      payload,
    );
    notiUser.socket.write(noti);
  });
};

export default gameEndNotification;
