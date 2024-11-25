import config from '../../config/config.js';
import { createResponse } from '../packet/response/createResponse.js';
import FleaMarket from '../../classes/models/fleaMarket.js';

const {
  packet: { packetType: PACKET_TYPE },
  winType: WIN_TYPE,
  role: { roleType: ROLE_TYPE },
} = config;

// message S2CFleaMarketNotification {
//     repeated CardType cardTypes = 1;
//     repeated int32 pickIndex = 2;
// }

// 플리마켓 시작됨을 알림
const fleaMarketNotification = (game) => {
  const liveUsers = game.getLiveUsers();

  game.fleaMarket = new FleaMarket(game, liveUsers.lnegth);

  const fleaMarketNotiData = {
    cardTypes: game.fleaMarket.cards,
    pickIndex: game.fleaMarket.indexs,
  };

  liveUsers.forEach((notiUser) => {
    const noti = createResponse(
      PACKET_TYPE.FLEA_MARKET_NOTIFICATION,
      notiUser.socket.sequence,
      fleaMarketNotiData,
    );
    notiUser.socket.write(noti);
  });
};

export default fleaMarketNotification;
