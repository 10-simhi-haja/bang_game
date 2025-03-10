import config from '../../config/config.js';
import { createResponse } from '../packet/response/createResponse.js';

const {
  packet: { packetType: PACKET_TYPE },
} = config;

// 현재 손패 알림
const handCardNotification = (user, game) => {
  const userCharacter = game.getCharacter(user.id);
  userCharacter.handCardsCount = userCharacter.handCards.length;
  const destroyCardResponseData = {
    handCards: userCharacter.handCards,
  };

  // 응답 패킷 생성
  const destroyCardResponse = createResponse(
    PACKET_TYPE.DESTROY_CARD_RESPONSE,
    user.socket.sequence,
    destroyCardResponseData,
  );

  user.socket.write(destroyCardResponse);
};

export default handCardNotification;
