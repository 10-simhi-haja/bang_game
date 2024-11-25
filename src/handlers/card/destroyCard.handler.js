import { getGameSessionBySocket, getGameSessionByUser } from '../../sessions/game.session.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';
import { PACKET_TYPE } from '../../constants/header.js';
import handleError from '../../utils/errors/errorHandler.js';
import { getUserBySocket } from '../../sessions/user.session.js';

const packetType = PACKET_TYPE;

// message C2SDestroyCardRequest {
//   repeated CardData destroyCards = 1;
// }

// message CardData {
//   CardType type = 1;
//   int32 count = 2;
// }

// 카드 버리기 요청 핸들러
const destroyCardRequest = (socket, payload) => {
  try {
    //const { destroyCards } = payload;
    console.log(`카드버리기 ${payload}`);

    //const user = getUserBySocket(socket);

    //const game = getGameSessionByUser(user);

    // const destroyCardResponse = createResponse(packetType.DESTROY_CARD_RESPONSE, socket.sequence, {
    //   handCards: remainingHandCards,
    // });

    // socket.write(destroyCardResponse);
  } catch (error) {
    handleError(socket, error);
  }
};

export default destroyCardRequest;
