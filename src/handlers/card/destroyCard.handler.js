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

    // 게임 룰 - 클라이언트에서 턴이 끝날때 요청하는 핸들러, 카드는 현재 체력보다 많을 수 없음
    // (어떻게???) 일단 임시로 저장하고 다른 로직 먼저 보기
    // 턴이 끝나면 현재 체력많큼 카드 수 맞추기? (만약에 현재 카드 수가 체력보다 많다면으로 진행)
    // 남은 카드들의 갯수를 구하고
    // (리듀스 사용 - 핸드에 들고있는 카드 배열을 반복을 도는데 카운트만큼 누적값에 더해서 총 값을 구한다면?)
    const handCards = currentUser.character.handCards;
    let remainingCards = handCards.reduce((total, card) => total + card.count, 0);

    for (let i = 0; i < destroyCards.length; i++) {
      const destroyCard = destroyCards[i];
      const cardIndex = handCards.findIndex((card) => card.type === destroyCard.type);

      // 버릴 카드를 현재 유저의 손에서 제거
      // 클라이언트에서 보낸 디스트로이 카드의 정보를 가지고 유저의 현재 인덱스에서 제거해야함
      // (어떻게?) 유저 핸드를 배열 안에 인덱스 단위로 반복문으로 조회 후 카드 위치를 선택 후 제거?
      if (cardIndex !== -1) {
        const handCard = handCards[cardIndex];
        if (handCard.count >= destroyCard.count) {
          // 남겨야 하는 카드 수를 초과하지 않도록 체크
          if (remainingCards - destroyCard.count >= minCardsToKeep) {
            handCard.count -= destroyCard.count;
            remainingCards -= destroyCard.count;

            if (handCard.count === 0) {
              handCards.splice(cardIndex, 1);
            }
          } else {
            const allowableDiscardCount = remainingCards - minCardsToKeep;
            if (allowableDiscardCount > 0) {
              handCard.count -= allowableDiscardCount;
              remainingCards -= allowableDiscardCount;

              if (handCard.count === 0) {
                handCards.splice(cardIndex, 1);
              }
              throw new Error(
                `체력만큼의 카드(최소 ${minCardsToKeep}장)를 유지해야 합니다. 남은 ${allowableDiscardCount}장의 카드만 버릴 수 있습니다.`,
              );
            } else {
              throw new Error(
                `체력만큼의 카드(최소 ${minCardsToKeep}장)를 유지해야 합니다. 카드를 버릴 수 없습니다.`,
              );
            }
          }
        } else {
          throw new Error(`유저의 손에 해당 수량의 ${destroyCard.type} 카드가 존재하지 않습니다.`);
        }
      } else {
        throw new Error(`카드 타입 ${destroyCard.type}이 현재 유저의 손에 없습니다.`);
      }
    }

    // 요청을 보낸 소켓에 성공 여부 및 최신 손 카드 리스트 보내기
    const destroyCardResponse = createResponse(packetType.DESTROY_CARD_RESPONSE, 0, {
      handCards,
    });
    socket.write(destroyCardResponse);
  } catch (error) {
    console.error('카드 버리기 중 에러 발생:', error.message);
  }
};

export default handleDestroyCardRequest;
