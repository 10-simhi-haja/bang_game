import config from '../../config/config.js';
import fleaMarketNotification from '../notification/fleaMarketNotification.js';

const {
  packet: { packetType: PACKET_TYPE },
  winType: WIN_TYPE,
  role: { roleType: ROLE_TYPE },
  character: { characterStateType: CHARACTER_STATE_TYPE },
  interval: INTERVAL,
  intervalType: INTERVAL_TYPE,
} = config;

export const setFleaMarketPickInterval = (game, user) => {
  if (game.getCharacter(user.id).stateInfo.state !== CHARACTER_STATE_TYPE.FLEA_MARKET_TURN) {
    return;
  }

  console.log(`플리마켓 선택안했어`);

  game.fleaMarket.randomPickCard(user);

  game.setAllUserNone();

  if (game.fleaMarket.cards.length > 0) {
    const nextUser = game.getNextUser(user.id);
    fleaMarketNotification(game, nextUser);
  }

  game.intervalManager.removeIntervalByType(user.id, INTERVAL_TYPE.CHARACTER_STATE);
};
