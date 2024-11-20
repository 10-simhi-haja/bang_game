import { PACKET_TYPE } from '../../constants/header.js';
import handleError from '../../utils/errors/errorHandler.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';
/**
 * TODO: useCard res,req,notification 완성하기
 */
const useCardHandler = ({ socket, payload }) => {
  try {
    const { cardType, targetUserId } = payload;

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
