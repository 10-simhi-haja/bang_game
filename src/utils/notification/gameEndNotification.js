import CardDeck from '../../classes/models/cardDeck.class.js';
import config from '../../config/config.js';
import { removeGameSessionById } from '../../sessions/game.session.js';
import { createResponse } from '../packet/response/createResponse.js';

const {
  packet: { packetType: PACKET_TYPE },
  winType: WIN_TYPE,
  role: { roleType: ROLE_TYPE },
} = config;

// 게임시작 알림
const gameEndNotification = async (users, gameId, payload) => {
  users.forEach((notiUser) => {
    const noti = createResponse(
      PACKET_TYPE.GAME_END_NOTIFICATION,
      notiUser.socket.sequence,
      payload,
    );
    notiUser.socket.write(noti);
  });

  const cardDeck = new CardDeck(gameId);
  await cardDeck.clearDeck();

  removeGameSessionById(gameId);
};

export default gameEndNotification;
