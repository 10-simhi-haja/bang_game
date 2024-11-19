import config from '../../config/config.js';
import { getAllGameSessions } from '../../sessions/game.session.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';

const roomListHnadler = async ({ socket, payload }) => {
  try {
    const roomData = getAllGameSessions();
    const responseRoomData = {
      rooms: roomData,
    };

    const roomListResponse = createResponse(
      config.packet.packetType.GET_ROOM_LIST_RESPONSE,
      socket.sequence,
      responseRoomData,
    );

    socket.write(roomListResponse);
  } catch (error) {
    handleError(socket, error);
  }
};

export default roomListHnadler;
