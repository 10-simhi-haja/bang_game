import config from '../../config/config.js';
import { createResponse } from '../packet/response/createResponse.js';

// 방에 남은 유저들에게 전달
const leaveRoomNotification = (socket, userId, room) => {
  console.log('나가는 사람: ', userId);
  console.log('room: ', room);

  const leaveRoomNotification = createResponse(
    config.packet.packetType.LEAVE_ROOM_NOTIFICATION,
    socket.sequence,
    userId,
  );

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
