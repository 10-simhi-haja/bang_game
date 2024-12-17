import { getGameSessionBySocket } from '../../sessions/game.session.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';
import config from '../../config/config.js';
import { getUserBySocket } from '../../sessions/user.session.js';
import handleError from '../../utils/errors/errorHandler.js';
import CustomError from '../../utils/errors/customError.js';
import ErrorCodes from '../../utils/errors/errorCodes.js';
import { getUserRedis, setUserPositionRedis } from '../../redis/game.redis.js';

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

    const prevX = currentUser.x;
    const prevY = currentUser.y;

    const now = Date.now();
    if (now - currentUser.lastUpdateTime < 250) {
      // console.log('아직 시간이 안 됐다.');
      return;
    }

    const distance = Math.sqrt(Math.pow(x - prevX, 2) + Math.pow(y - prevY, 2));
    if (distance < 0.25) {
      // console.log('아직 거리가 안 됐다.');
      return;
    }

    currentUser.setPos(x, y);
    // currentUser.lastUpdateTime = now;
    setUserPositionRedis(gameSession.id, currentUser.id, x, y);

    const allUser = gameSession.getAllUsers();
    const userRedis = await getUserRedis(gameSession.id, currentUser.id);

    const characterPositions = allUser.map((user) => ({
      id: user.id,
      x: userRedis.x,
      y: userRedis.y,
    }));

    const notiData = {
      characterPositions: characterPositions,
    };

    // 노티피케이션 생성 및 전송
    const notificationResponse = createResponse(
      packetType.POSITION_UPDATE_NOTIFICATION,
      socket.sequence,
      notiData,
    );

    allUser.forEach((notiUser) => {
      if (notiUser.id === currentUser.id) {
        return;
      }
      notiUser.socket.write(notificationResponse);
    });
  } catch (error) {
    handleError(socket, error);
  }
};

export default handlePositionUpdate;
