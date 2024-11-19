import config from '../../config/config.js';
import { getGameSessionById } from '../../sessions/game.session.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';

const joinRoomHandler = async ({ socket, payload }) => {
  try {
    const roomId = payload.roomId;
    const room = getGameSessionById(roomId);

    const responseData = {
      success: true,
      room: room,
      failcode: 0,
    };

    const joinRoomResponse = createResponse(
      config.packet.packetType.JOIN_ROOM_RESPONSE,
      socket.sequence,
      responseData,
    );

    socket.write(joinRoomResponse);
  } catch (error) {
    handleError(socket, error);
  }
};

export default joinRoomHandler;
