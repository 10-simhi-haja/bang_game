import config from '../../config/config.js';
import { getGameSessionByUser } from '../../sessions/game.session.js';
import { getUserBySocket } from '../../sessions/user.session.js';
import handleError from '../../utils/errors/errorHandler.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';

const {
  packet: { packetType: PACKET_TYPE },
  card: { cardType: CARD_TYPE },
  globalFailCode: { globalFailCode: GLOBAL_FAIL_CODE },
} = config;

const cardSelectHandler = ({ socket, payload }) => {
  try {
    const user = getUserBySocket(socket);
    const room = getGameSessionByUser(user);
    const { selectType, selectCardType } = payload;
    console.log(`selectType = ${selectType}, selectCardType = ${selectCardType}`);

    // switch (selectCardType) {
    //   case CARD_TYPE.HALLUCINATION:

    // }

    const responseData = {
      success: true,
      failCode: GLOBAL_FAIL_CODE.NONE_FAILCODE,
    };

    const cardSelectPayload = createResponse(
      PACKET_TYPE.CARD_SELECT_RESPONSE,
      socket.sequence,
      responseData,
    );

    socket.write(cardSelectPayload);
  } catch (err) {
    handleError(socket, err);
  }
};

export default cardSelectHandler;
