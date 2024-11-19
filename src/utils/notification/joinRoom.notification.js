import makeNotification from './makeNotification.js';
import config from '../../config/config.js';

const {
  packet: { packetType: PACKET_TYPE },
} = config;

export const createJoinRoomNotification = (joinUserData, user) => {
  const packetType = PACKET_TYPE.JOIN_ROOM_NOTIFICATION;
  const payload = { joinUserData };
  console.log(`노티 내부 : ${user.nickname}`);
  return makeNotification(packetType, payload, user);
};
