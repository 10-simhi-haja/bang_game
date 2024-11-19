import { getGameSession } from '../../sessions/game.session.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';
import { PACKET_TYPE } from '../../constants/header.js';

const packetType = PACKET_TYPE;

const handlePositionUpdate = async ({ socket, payload }) => {
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

    const success = gameSession.updateCharacterPosition(user.id, payload.x, payload.y);

    if (success) {
      const positionResponse = createResponse(packetType.POSITION_UPDATE_RESPONSE, 0, {
        x: payload.x,
        y: payload.y,
      });
      socket.write(positionResponse);

      // 수정 필요
      // 알림 로직은 리스폰스로 보내면 요청이 올때 응답을 해서 주기적으로 보내야하는 알림 로직과는 맞지 않음
      const positionNotification = createResponse(packetType.POSITION_UPDATE_NOTIFICATION, 0, {
        characterPositions: [{ userId: user.id, x: payload.x, y: payload.y }],
        type: packetType.POSITION_UPDATE_NOTIFICATION,
        success: true,
      });
      opponent.socket.write(positionNotification);
    } else {
      throw new Error('캐릭터 위치 업데이트에 실패하였습니다.');
    }
  } catch (error) {
    console.error('위치 업데이트 중 에러 발생:', error.message);

    const errorResponse = createResponse(packetType.POSITION_UPDATE_RESPONSE, 0, {
      success: false,
      data: { message: error.message || 'Error updating position', failCode: 1 },
    });
    socket.write(errorResponse);
  }
};

export default handlePositionUpdate;
