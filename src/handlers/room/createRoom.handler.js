import handleError from '../../utils/errors/errorHandler.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';
import config from '../../config/config.js';
import { addGameSession } from '../../sessions/game.session.js';
import { getUserBySocket } from '../../sessions/user.session.js';
import { setGameRedis, setUserRedis } from '../../redis/game.redis.js';

let count = 10;
const createRoomHandler = async ({ socket, payload }) => {
  try {
    const { name, maxUserNum } = payload;
    let roomData = {
      id: ++count,
      ownerId: getUserBySocket(socket).id,
      name: name,
      maxUserNum: maxUserNum,
      state: config.roomStateType.wait,
      users: [],
    };

    // 게임 세션 생성
    const gameSession = await addGameSession(roomData);
    setGameRedis(roomData);

    // 방을 생성한 유저를 찾는다
    const user = getUserBySocket(socket);
    gameSession.addUser(user);

    const redisUserData = {
      id: gameSession.id,
      userData: {
        id: user.id,
        socketId: socket.id,
      },
    };
    setUserRedis(redisUserData);

    const responseData = {
      success: true,
      room: gameSession.getRoomData(),
      failCode: 0,
    };

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

export default createRoomHandler;
