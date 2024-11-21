import { getGameSessionBySocket } from '../../sessions/game.session.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';
import { PACKET_TYPE, REACTION_TYPE } from '../../constants/header.js';

const packetType = PACKET_TYPE;

// 리액션 요청 핸들러
const handleReactionRequest = async (socket, payload) => {
  try {
    const { reactionType } = payload;

    const gameSession = getGameSessionBySocket(socket);
    if (!gameSession) {
      throw new Error('해당 유저의 게임 세션이 존재하지 않습니다.');
    }

    const currentUser = gameSession.users.find((user) => user.socket === socket);
    if (!currentUser) {
      throw new Error('현재 유저가 존재하지 않습니다.');
    }

    switch (reactionType) {
      case REACTION_TYPE.NOT_USE_CARD:
        // 카드 미사용 처리 로직
        break;
      case REACTION_TYPE.NONE_REACTION:
        // 카드를 사용 하지 않았을때 로직?
        break;
      default:
        throw new Error('유효하지 않은 리액션 타입입니다.');
    }

    // 요청을 보낸 소켓에 성공 여부 보내기
    const reactionResponseData = {
      success: true,
      failCode: 0,
    };
    const reactionResponse = createResponse(
      packetType.REACTION_RESPONSE,
      socket.sequence,
      reactionResponseData,
    );
    socket.write(reactionResponse);
  } catch (error) {
    console.error('리액션 처리 중 에러 발생:', error.message);

    // 요청을 보낸 소켓에 실패 여부 보내기
    const errorResponse = createResponse(packetType.REACTION_RESPONSE, socket.sequence, {
      success: false,
      failCode: 1,
      message: error.message || 'Reaction failed',
    });
    socket.write(errorResponse);
  }
};

export default handleReactionRequest;
