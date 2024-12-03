import config from '../../config/config.js';
import { getGameSessionByUser } from '../../sessions/game.session.js';
import { getUserBySocket } from '../../sessions/user.session.js';
import { createResponse } from '../packet/response/createResponse.js';

const {
  packet: { packetType: PACKET_TYPE },
} = config;

// 게임시작 알림
const gameStartNotification = (socket, user, payload) => {
  const noti = createResponse(PACKET_TYPE.GAME_START_NOTIFICATION, socket.sequence, payload);
  user.socket.write(noti);
};

export default gameStartNotification;
