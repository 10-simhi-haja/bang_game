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

    // 기본은 논 리액션으로 가기, 만약에 카드를 사용 할 수 있으면 쓸지 말지 선택하기? (스위치 말고 조건문으로?)
    // 클라이언트 코드 보고 결정
    switch (reactionType) {
      case REACTION_TYPE.NOT_USE_CARD:
        // 카드를 사용 할 수 있으나 사용을 안함
        break;
      case REACTION_TYPE.NONE_REACTION:
        // 기본값, 카드를 사용 할 수 없음
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
