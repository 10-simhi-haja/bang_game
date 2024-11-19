import handleError from '../../utils/errors/errorHandler.js';
import { v4 as uuidv4 } from 'uuid';
import { createResponse } from '../../utils/packet/response/createResponse.js';
import config from '../../config/config.js';
import { addGameSession } from '../../sessions/game.session.js';
import { getUserBySocket } from '../../sessions/user.session.js';

const createRoomHnadler = async ({ socket, payload }) => {
  try {
    const { name, maxUserNum } = payload;
    let roomData = {
      id: uuidv4(),
      ownerId: getUserBySocket(socket).userId,
      name: name,
      maxUserNum: maxUserNum,
      state: config.roomStateType.wait,
      users: [],
    };

    const responseData = {
      success: true,
      room: roomData,
      failcode: 0,
    };

    // 게임 세션 생성
    const gameSession = addGameSession(roomData);

    // 방을 생성한 유저를 찾는다
    const user = getUserBySocket(socket);

    // 생성한 유저를 집어 넣기
    gameSession.addUser(user);

    // 응답
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
