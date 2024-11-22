import { getGameSessionBySocket } from '../../sessions/game.session.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';
import { PACKET_TYPE, REACTION_TYPE } from '../../constants/header.js';

const packetType = PACKET_TYPE;

// 리액션 요청 핸들러
const handleReactionRequest = async (socket, payload) => {
  try {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Payload가 올바르지 않습니다.');
    }

    const { reactionType } = payload;

    if (
      typeof reactionType !== 'number' ||
      ![REACTION_TYPE.NONE_REACTION, REACTION_TYPE.NOT_USE_CARD].includes(reactionType)
    ) {
      throw new Error('유효하지 않은 리액션 타입입니다.');
    }

    const gameSession = getGameSessionBySocket(socket);
    if (!gameSession) {
      throw new Error('해당 유저의 게임 세션이 존재하지 않습니다.');
    }

    const currentUser = gameSession.users.find((user) => user.socket === socket);
    if (!currentUser) {
      throw new Error('현재 유저가 존재하지 않습니다.');
    }

    // 리액션 타입에 따른 처리
    if (reactionType === REACTION_TYPE.NOT_USE_CARD) {
      // 카드를 사용 할 수 있으나 사용을 안함
      gameSession.processNotUseCard(currentUser, payload);
    } else if (reactionType === REACTION_TYPE.NONE_REACTION) {
      // 기본값, 카드를 사용 할 수 없음
      gameSession.processNoneReaction(currentUser, payload);
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
