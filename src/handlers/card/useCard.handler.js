import { PACKET_TYPE } from '../../constants/header.js';
import { getGameSessionByUser } from '../../sessions/game.session.js';
import { getUserBySocket } from '../../sessions/user.session.js';
import handleError from '../../utils/errors/errorHandler.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';
/**
 * TODO: useCard res,req,notification 완성하기
 */
const useCardHandler = ({ socket, payload }) => {
  try {
    const { cardType, targetUserId } = payload;
    const user = getUserBySocket(socket);
    const room = getGameSessionByUser(user);

    // 카드 타입에 맞게

    const userCardPayload = {
      success: true,
      failCode: 0,
    };

    const userCardResponse = createResponse(
      PACKET_TYPE.USE_CARD_RESPONSE,
      socket.sequence,
      userCardPayload,
    );
    socket.write(userCardResponse);
  } catch (e) {
    handleError(socket, e);
  }
};

export default useCardHandler;
