import config from '../../config/config.js';
import { getGameSessionByUser } from '../../sessions/game.session.js';
import {
  getUserBySocket,
  getUserSessions,
  removeUserBySocket,
} from '../../sessions/user.session.js';
import handleError from '../../utils/errors/errorHandler.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';

const leaveRoomHandler = async ({ socket, payload }) => {
  try {
    // 나간 유저를 게임 세션에서 없앤다.
    const user = getUserBySocket(socket);
    const room = getGameSessionByUser(user);

    console.log('방을 정보: ', room.id);

    // removeUserBySocket(socket);
    // console.log('남아 있는 유저: ', getUserSessions().length);

    // // 방에 남아 있는 사람이 0 이하면 방은 삭제 된다.
    // if(getUserSessions().length <= 0 ) {

    // }

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
