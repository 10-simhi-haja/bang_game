import { getGameSession } from '../../sessions/game.session.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';
import { PACKET_TYPE } from '../../constants/header.js';

const packetType = PACKET_TYPE;

const handlePositionUpdate = async ({ socket, payload }) => {
  // 검증 과정
  try {
    const gameSession = getGameSession(socket);
    if (!gameSession) {
      throw new Error('해당 유저의 게임 세션이 존재하지 않습니다.');
    }

    const user = gameSession.users.find((user) => user.socket === socket);
    if (!user) {
      throw new Error('유저가 존재하지 않습니다.');
    }

    const opponent = gameSession.users.find((user) => user.socket !== socket);
    if (!opponent) {
      throw new Error('상대 유저가 존재하지 않습니다.');
    }

    // 캐릭터 위치 업데이트 수행
    const success = gameSession.updateCharacterPosition(user.id, payload.x, payload.y);

    if (success) {
      // 위치 업데이트 성공 응답 생성
      const positionResponse = createResponse({
        success: true,
        type: packetType.POSITION_UPDATE_RESPONSE,
        data: { x: payload.x, y: payload.y },
      });
      socket.write(positionResponse);

      // 상대 플레이어에게 위치 업데이트 알림 전송
      const positionNotification = createResponse({
        characterPositions: [{ userId: user.id, x: payload.x, y: payload.y }],
        type: packetType.POSITION_UPDATE_NOTIFICATION,
        success: true,
      });
      opponent.socket.write(positionNotification);
    } else {
      throw new Error('캐릭터 위치 업데이트에 실패하였습니다.');
    }
  } catch (error) {
    console.error('위치 업데이트 중 에러 발생:', error);

    const errorResponse = createResponse({
      success: false,
      type: packetType.POSITION_UPDATE_RESPONSE,
      data: { message: error.message || 'Error updating position', failCode: 1 },
    });
    socket.write(errorResponse);
  }
};

export default handlePositionUpdate;
