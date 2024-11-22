import config from '../../config/config.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';

const {
  card: { cardType: CARD_TYPE },
  globalFailCode: { globalFailCode: GLOBAL_FAIL_CODE },
} = config;

const cardSelectHandler = ({ socket, payload }) => {
  console.log('socket: ', socket);
  const { selectType, selectCardType } = payload;
  console.log(`selectType = ${selectType}, selectCardType = ${selectCardType}`);

  const responseData = {
    success: true,
    failCode: GLOBAL_FAIL_CODE.NONE_FAILCODE,
  };

  const cardSelectPayload = createResponse(
    config.packet.packetType.CARD_SELECT_RESPONSE,
    socket.sequence,
    responseData,
  );

  socket.write(cardSelectPayload);
};

export default cardSelectHandler;
