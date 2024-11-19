import handleError from '../../utils/errors/errorHandler.js';
import { v4 as uuidv4 } from 'uuid';
import { createResponse } from '../../utils/packet/response/createResponse.js';
import config from '../../config/config.js';
import { addGameSession } from '../../sessions/game.session.js';

const createRoomHnadler = async ({ socket, payload }) => {
  try {
    const { name, maxUserNum } = payload;
    let roomData = {
      id: uuidv4(),
      ownerId: socket.account_id,
      name: name,
      maxUserNum: maxUserNum,
      state: 0, // WAIT 0, PREPARE 1, INAGAME 2
      users: [],
    };

    const responseData = {
      success: true,
      room: roomData,
      failcode: 0,
    };

    console.log(typeof roomData.state);
    console.log(roomData.state);
    addGameSession(roomData);

    const createRoomResponse = createResponse(
      config.packet.packetType.CREATE_ROOM_RESPONSE,
      socket.sequence,
      responseData,
    );

    socket.write(createRoomResponse);
  } catch (error) {
    handleError(socket, error);
  }
};

export default createRoomHnadler;

// 요청
// {
//     string name = 1;
//     int32 maxUserNum = 2;
// }
