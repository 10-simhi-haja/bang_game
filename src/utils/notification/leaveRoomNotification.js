import config from '../../config/config.js';
import { createResponse } from '../packet/response/createResponse.js';

// 방에 남은 유저들에게 전달
const leaveRoomNotification = (socket, userId, room, ownerOut) => {
  // 응답 패킷 생성
  const responseData = {
    userId: userId,
  };

  let leaveRoomNotification;
  if (ownerOut === true) {
    // 방 주인이 나갔을 경우
    const responseData = {
      success: true,
      failCode: 0,
    };
    leaveRoomNotification = createResponse(
      config.packet.packetType.LEAVE_ROOM_RESPONSE,
      socket.sequence,
      responseData,
    );
  } else {
    leaveRoomNotification = createResponse(
      config.packet.packetType.LEAVE_ROOM_NOTIFICATION,
      socket.sequence,
      responseData,
    );
  }

  // 나를 제외한 = 방에 남은 유저들에게만 알림 전송
  Object.entries(room.users).forEach(([key, userData]) => {
    if (key !== userId.toString()) {
      const userSocket = userData.user.socket;
      if (userSocket) {
        userSocket.write(leaveRoomNotification);
      }
    }
  });
};

export default leaveRoomNotification;
