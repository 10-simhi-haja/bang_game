import config from '../../config/config.js';
import { getUserBySocket } from '../../sessions/user.session.js';
import handleError from '../../utils/errors/errorHandler.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';

const leaveRoomHandler = async ({ socket, payload }) => {
  try {
    // 방 나가기 응답
    const responseData = {
      success: true,
      failcode: 0,
    };

    const leaveRoomResponse = createResponse(
      config.packet.packetType.LEAVE_ROOM_RESPONSE,
      socket.sequence,
      responseData,
    );

    socket.write(leaveRoomResponse);
  } catch (error) {
    handleError(socket, error);
  }
};

export default leaveRoomHandler;
