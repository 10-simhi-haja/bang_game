import { getGameSessionByUser, removeGameSessionById } from '../sessions/game.session.js';
import { getUserBySocket, removeUserBySocket } from '../sessions/user.session.js';
import leaveRoomNotification from '../utils/notification/leaveRoomNotification.js';
import { createResponse } from '../utils/packet/response/createResponse.js';
import config from '../config/config.js';
import CustomError from '../utils/errors/customError.js';
import ErrorCodes from '../utils/errors/errorCodes.js';

// ! 게임 중에 방장이 나가면 오류 발생!!!!
// 종료되면 해당 유저 게임에서 제거하는 과정.
export const onEnd = (socket) => async () => {
  console.log('클라이언트와 연결이 종료되었다.');
  const user = getUserBySocket(socket);
  if (!user) {
    console.error('유저를 찾을 수 없다: ', socket.id);
    throw new CustomError(ErrorCodes.USER_NOT_FOUND, '유저를 찾을 수 없다', socket.sequence);
  }
  const room = getGameSessionByUser(user);

  // 유저가 게임에 속했을 경우
  if (room && room.state !== config.roomStateType.inGame) {
    console.log('이건 뭘까?: ', room.state);
    room.removeUser(user.id);

    // 방장이 나갔을 경우
    // 방장이 나가면 모든 사람을 내쫒고 방은 삭제
    let usersLength = room.getUserLength();
    if (user.id === room.ownerId) {
      leaveRoomNotification(socket, user.id, room, true);
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
  }
  removeUserBySocket(socket);
};

export default onEnd;
