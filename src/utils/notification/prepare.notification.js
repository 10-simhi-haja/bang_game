import makeNotification from './makeNotification.js';
import config from '../../config/config.js';

const {
  packet: { packetType: PACKET_TYPE },
} = config;

// enemyTowerAttackNotification
export const prepareNotification = (roomData, user) => {
  const packetType = PACKET_TYPE.GAME_PREPARE_NOTIFICATION;
  const payload = { roomData };
  return makeNotification(packetType, payload, user);
};

export const joinRoomNotification = (joinUserData, user) => {
  const packetType = PACKET_TYPE.JOIN_ROOM_NOTIFICATION;
  const payload = { joinUserData };
  return makeNotification(packetType, payload, user);
};
