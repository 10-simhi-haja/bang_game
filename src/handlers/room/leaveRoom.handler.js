import config from '../../config/config.js';
import { deleteGameFolderRedis } from '../../redis/game.redis.js';
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

    // 방장이 나갔을 경우
    // 방장이 나가면 모든 사람을 내쫒고 방은 삭제
    let usersLength = room.getUserLength();
    if (user.id === room.ownerId) {
      leaveRoomNotification(socket, user.id, room, true);
      deleteGameFolderRedis(room.id);
      usersLength = 0;
    }

    // 방에 남아 있는 사람이 0 이하면 방은 삭제 된다.
    if (usersLength <= 0) {
      removeGameSessionById(room.id);
    } else {
      // 아닐 경우에는 남은 사람들에게 알림 전송
      leaveRoomNotification(socket, user.id, room, false);
    }

    // 방 나가기 응답
    const responseData = {
      success: true,
      failCode: 0,
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
