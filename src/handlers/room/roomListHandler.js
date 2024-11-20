import config from '../../config/config.js';
import { getAllGameSessions } from '../../sessions/game.session.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';
import handleError from '../../utils/errors/errorHandler.js';

const roomListHandler = async ({ socket, payload }) => {
  try {
    const gameSessions = getAllGameSessions();
    const roomDatas = [];

    for (let i = 0; i < gameSessions.length; i++) {
      const roomData = gameSessions[i].getRoomData();
      roomDatas.push(roomData);
    }

    // const roomData = getAllGameSessions();
    const responseRoomData = {
      rooms: roomDatas,
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

export default roomListHandler;
