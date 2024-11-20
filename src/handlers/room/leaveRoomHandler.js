import config from '../../config/config.js';
import { getGameSessionByUser, removeGameSessionById } from '../../sessions/game.session.js';
import { getUserBySocket } from '../../sessions/user.session.js';
import handleError from '../../utils/errors/errorHandler.js';
import leaveRoomNotification from '../../utils/notification/leaveRoomNotification.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';

const leaveRoomHandler = async ({ socket, payload }) => {
  try {
    // 방에서 나가려는 유저와 해당 방 찾기
    const user = getUserBySocket(socket);
    const room = getGameSessionByUser(user);

    // 나간 유저를 게임 세션에서 없앤다.
    room.removeUser(user.id);

    // // 방에 남아 있는 사람이 0 이하면 방은 삭제 된다.
    let usersLength = Object.keys(room.users).length;
    if (usersLength <= 0) {
      removeGameSessionById(room.id);
    }

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
    leaveRoomNotification(socket, user.id, room);
  } catch (error) {
    handleError(socket, error);
  }
};

export default leaveRoomHandler;
