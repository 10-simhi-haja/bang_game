import { getGameSessionBySocket } from '../../sessions/game.session.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';
import { PACKET_TYPE } from '../../constants/header.js';

const packetType = PACKET_TYPE;

// 카드 버리기 요청 핸들러
const handleDestroyCardRequest = async (socket, payload) => {
  try {
    const { destroyCards } = payload;

    const gameSession = getGameSessionBySocket(socket);
    if (!gameSession) {
      throw new Error('해당 유저의 게임 세션이 존재하지 않습니다.');
    }

    const currentUser = gameSession.users.find((user) => user.socket === socket);
    if (!currentUser) {
      throw new Error('현재 유저가 존재하지 않습니다.');
    }

    // 버릴 카드 목록에서 카드들을 제거
    destroyCards.forEach((destroyCard) => {
      for (let i = 0; i < destroyCard.count; i++) {
        const cardIndex = currentUser.character.handCards.findIndex(
          (card) => card.type === destroyCard.type,
        );
        if (cardIndex !== -1) {
          currentUser.character.handCards.splice(cardIndex, 1);
        } else {
          throw new Error(
            `유저의 핸드에 ${destroyCard.type} 타입의 카드가 충분히 존재하지 않습니다.`,
          );
        }
      }
    });

    // 현재 유저의 남은 카드 목록을 응답
    const remainingHandCards = currentUser.character.handCards.map((card) => ({
      type: card.type,
      count: card.count,
    }));

    const destroyCardResponse = createResponse(packetType.DESTROY_CARD_RESPONSE, socket.sequence, {
      handCards: remainingHandCards,
    });

    socket.write(destroyCardResponse);
  } catch (error) {
    console.error('카드 버리기 중 에러 발생:', error.message);

    // 요청을 보낸 소켓에 실패 여부 보내기
    const errorResponse = createResponse(packetType.DESTROY_CARD_RESPONSE, socket.sequence, {
      handCards: currentUser.character.handCards.map((card) => ({
        type: card.type,
        count: card.count,
      })),
    });
    socket.write(errorResponse);
  }
};

export default handleDestroyCardRequest;
