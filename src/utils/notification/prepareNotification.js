import config from '../../config/config.js';
import { createResponse } from '../packet/response/createResponse.js';

const {
  packet: { packetType: PACKET_TYPE },
} = config;

// 역할 분배 알림
const prepareNotification = (socket, user, payload) => {
  const noti = createResponse(PACKET_TYPE.GAME_PREPARE_NOTIFICATION, socket.sequence, payload);

  user.socket.write(noti);
};

export default prepareNotification;
