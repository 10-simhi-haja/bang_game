import { getGameSessionBySocket } from '../../sessions/game.session.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';
import { PACKET_TYPE } from '../../constants/header.js';

const packetType = PACKET_TYPE;

// 유저 위치 업데이트 함수
const updateCharacterPosition = (gameSession, userId, x, y) => {
  const targetUser = gameSession.users.find((user) => user.id === userId);
  if (!targetUser) return false;

  targetUser.position = { x, y };
  return true;
};

// 상대 유저들에게 위치 업데이트 전송 함수
const sendPositionUpdateToOpponents = (gameSession, updatedUserId, payload) => {
  gameSession.users.forEach((user) => {
    if (user.id !== updatedUserId) {
      const notification = Buffer.alloc(10);
      // 패킷 타입 설정
      notification.writeUInt16BE(packetType.POSITION_UPDATE_NOTIFICATION, 0);

      // 좌표 값
      notification.writeUInt32BE(payload.x, 2);
      notification.writeUInt32BE(payload.y, 6);

      user.socket.write(notification);
    }
  });
};

// 주기적으로 위치 정보를 전송하는 함수
const startPeriodicPositionUpdates = (gameSession) => {
  setInterval(() => {
    gameSession.users.forEach((currentUser) => {
      const { id, position } = currentUser;
      sendPositionUpdateToOpponents(gameSession, id, { x: position.x, y: position.y });
    });
  }, 1000);
};

// 위치 업데이트 요청 핸들러
const handlePositionUpdate = async (socket, payload) => {
  try {
    const { x, y } = payload;
    const gameSession = getGameSessionBySocket(socket);
    if (!gameSession) {
      throw { message: '해당 유저의 게임 세션이 존재하지 않습니다.', failCode: 2 };
    }

    const currentUser = gameSession.users.find((user) => user.socket === socket);
    if (!currentUser) {
      throw { message: '유저가 존재하지 않습니다.', failCode: 3 };
    }

    // 위치 업데이트 호출
    const success = updateCharacterPosition(gameSession, currentUser.id, x, y);

    if (success) {
      const positionResponse = createResponse(packetType.POSITION_UPDATE_RESPONSE, 0, {
        success: true,
        failCode: 0,
      });
      socket.write(positionResponse);

      // 위치를 업데이트 시 바로 상대에게 전송
      sendPositionUpdateToOpponents(gameSession, currentUser.id, { x, y });
    } else {
      throw { message: '캐릭터 위치 업데이트에 실패하였습니다.', failCode: 1 };
    }

    // 주기적으로 위치 정보를 전송하도록 타이머 시작 (한 번만 시작)
    if (!gameSession.isPeriodicUpdateStarted) {
      gameSession.isPeriodicUpdateStarted = true;
      startPeriodicPositionUpdates(gameSession);
    }
  } catch (error) {
    console.error('위치 업데이트 중 에러 발생:', error.message);

    const errorResponse = createResponse(packetType.POSITION_UPDATE_RESPONSE, 0, {
      success: false,
      failCode: error.failCode || 1,
    });
    socket.write(errorResponse);
  }
};

export default handlePositionUpdate;
