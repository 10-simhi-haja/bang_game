import config from '../../config/config.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';

const cardSelectHandler = (socket, payload) => {
  const { selectType, selectCardType } = payload;

  const responseData = {
    success: true,
    failCode: 0,
  };

  const cardSelectPayload = createResponse(
    config.packet.packetType.CARD_SELECT_RESPONSE,
    socket.sequence,
    responseData,
  );

  socket.write(cardSelectPayload);
};

export default cardSelectHandler;
