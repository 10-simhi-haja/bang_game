import config from '../../config/config.js';
import { createResponse } from '../packet/response/createResponse.js';

const {
  packet: { packetType: PACKET_TYPE },
} = config;

// 방에 남은 유저들에게 전달
const prepareNotification = (socket, user, payload) => {
  // 응답 패킷 생성
  const noti = createResponse(PACKET_TYPE.GAME_PREPARE_NOTIFICATION, socket.sequence, payload);

  user.socket.write(noti);
};

export default prepareNotification;
