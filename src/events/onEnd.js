import { getGameSessionByUser, removeGameSessionById } from '../sessions/game.session.js';
import { getUserBySocket, getUserSessions, removeUserBySocket } from '../sessions/user.session.js';
import config from '../config/config.js';
import CustomError from '../utils/errors/customError.js';
import ErrorCodes from '../utils/errors/errorCodes.js';
import handleError from '../utils/errors/errorHandler.js';
import userUpdateNotification from '../utils/notification/userUpdateNotification.js';
import leaveRoomHandler from '../handlers/room/leaveRoom.handler.js';

// ! 게임 중에 방장이 나가면 오류 발생!!!!
// 종료되면 해당 유저 게임에서 제거하는 과정.
const userDie = (room, user) => {
  console.log('죽는 거 실행!');
  const userCharacter = room.getCharacter(user.id);
  userCharacter.hp = 0;
  userUpdateNotification(room);
  room.intervalManager.removeIntervalByType(user.id, config.intervalType.GAME_RUN);
};

export const onEnd = (socket) => async () => {
  try {
    console.log('클라이언트와 연결이 종료되었다.');
    const user = getUserBySocket(socket);
    if (!user) {
      console.error('유저를 찾을 수 없다: ', socket.id);
      throw new CustomError(ErrorCodes.USER_NOT_FOUND, '유저를 찾을 수 없다', socket.sequence);
    }
    removeUserBySocket(socket); // 유저 세션에서 유저 삭제

    const room = getGameSessionByUser(user);
    // 유저에게 방이 있고, 게임 중에 나갔을 경우
    if (room && room.state === config.roomStateType.inGame) {
      console.log('게임 중에 나갔다.');
      room.intervalManager.addInterval(
        user.id,
        () => userDie(room, user),
        config.interval.GAME_RUN,
        config.intervalType.GAME_RUN,
      );
    } else if (room && room.state !== config.roomStateType.inGame) {
      console.log('이쪽에서 방을 나갔다!!');
      leaveRoomHandler({ socket });
    }
  } catch (error) {
    handleError(socket, error);
  }
};

export default onEnd;
