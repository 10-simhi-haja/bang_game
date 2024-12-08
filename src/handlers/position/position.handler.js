import { getGameSessionBySocket } from '../../sessions/game.session.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';
import config from '../../config/config.js';
import { getUserBySocket } from '../../sessions/user.session.js';
import handleError from '../../utils/errors/errorHandler.js';
import CustomError from '../../utils/errors/customError.js';
import ErrorCodes from '../../utils/errors/errorCodes.js';

const packetType = config.packet.packetType;

const handlePositionUpdate = async ({ socket, payload }) => {
  try {
    if (!payload || typeof payload !== 'object') {
      throw new CustomError(ErrorCodes.PAYLOAD_ERROR, 'Payload가 올바르지 않다.', socket.sequence);
    }

    const { x, y } = payload;
    if (typeof x === 'undefined' || typeof y === 'undefined') {
      throw new CustomError(
        ErrorCodes.NOT_FOUND_POSITION,
        '페이로드에 x 또는 y 값이 없습니다.',
        socket.sequence,
      );
    }

    const gameSession = getGameSessionBySocket(socket);
    const currentUser = getUserBySocket(socket);

    currentUser.setPos(x, y);

    const characterPositions = [];
    const allUser = gameSession.getAllUsers();

    allUser.forEach((user, i) => {
      const posData = {
        id: user.id,
        x: user.x,
        y: user.y,
      };
      characterPositions.push(posData);
    });

    // const notiData = {
    //   characterPositions: characterPositions,
    // };

    // // 노티피케이션 생성 및 전송
    // const notificationResponse = createResponse(
    //   packetType.POSITION_UPDATE_NOTIFICATION,
    //   socket.sequence,
    //   notiData,
    // );

    // allUser.forEach((notiUser) => {
    //   if (notiUser.id === currentUser.id) {
    //     return;
    //   }
    //   notiUser.socket.write(notificationResponse);
    // });
  } catch (error) {
    handleError(socket, error);
  }
};

export default handlePositionUpdate;
