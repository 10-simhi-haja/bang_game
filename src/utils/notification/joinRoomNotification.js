import config from '../../config/config.js';
import { createResponse } from '../packet/response/createResponse.js';

// 방에 남은 유저들에게 전달
const joinRoomNotification = (socket, userId,userData,room) => {
  // 응답 패킷 생성
  
  const notificationData = {
    joinUser: userData
  }
  const joinRoomNotification = createResponse(
    config.packet.packetType.JOIN_ROOM_NOTIFICATION,
    socket.sequence,
    notificationData,
  );

  // 나를 제외한 = 방에 남은 유저들에게만 알림 전송
  Object.entries(room.users).forEach(([key, userData]) => {
    if (key !== userId.toString()) {
      const userSocket = userData.user.socket;
      if (userSocket) {
        userSocket.write(joinRoomNotification);
      }
    }
  });
};

export default joinRoomNotification;
