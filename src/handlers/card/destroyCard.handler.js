import { getGameSessionByUser } from '../../sessions/game.session.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';
import handleError from '../../utils/errors/errorHandler.js';
import { getUserBySocket } from '../../sessions/user.session.js';
import config from '../../config/config.js';
import handCardNotification from '../../utils/notification/handCardsNotification.js';

const {
  packet: { packetType: PACKET_TYPE },
} = config;

// message C2SDestroyCardRequest {
//   repeated CardData destroyCards = 1;
// }

// message CardData {
//   CardType type = 1;
//   int32 count = 2;
// }

// 카드 버리기 요청 핸들러
const destroyCardRequestHandler = ({ socket, payload }) => {
  try {
    const { destroyCards } = payload;

    const user = getUserBySocket(socket);

    const game = getGameSessionByUser(user);

    // 요청온 카드의 숫자만큼 반복제거
    destroyCards.forEach((card) => {
      for (let i = 0; i < card.count; i++) {
        game.removeCard(user.id, card.type);
      }
    });

    // 여기까지 오면 요청받은 카드는 제거 당한 상태.
    handCardNotification(user);
  } catch (error) {
    handleError(socket, error);
  }
};

export default destroyCardRequestHandler;
