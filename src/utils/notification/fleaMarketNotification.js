import config from '../../config/config.js';
import { createResponse } from '../packet/response/createResponse.js';
import FleaMarket from '../../classes/models/fleaMarket.js';
import userUpdateNotification from './userUpdateNotification.js';

const {
  packet: { packetType: PACKET_TYPE },
  winType: WIN_TYPE,
  role: { roleType: ROLE_TYPE },
  character: { characterStateType: CHARACTER_STATE_TYPE },
} = config;

// 1, 플리마켓 노티 쫙 쏘고
// 2, 전체유저를 플리마켓 턴 대기상태로 만들고
// 2-1, 시전자만 플리마켓 턴 대기상태로 만들고
// 3, 시전자가 플리마켓 고르면
// 4, 리퀘스트가 서버로오고 해당 리퀘스트 수행하면서
// 5, 끝난 유저는 플리마켓 대기상태로 만들고
// 6, 다음 유저에게 플리마켓 자신의턴 상태로 해준다.

// 번외로, 자신의 플리마켓 턴까지 안고르면
// 랜덤으로 고르게하고 4번부터 수행하도록 해야함
// 그러기 위한 nextStateAt으로 추정됨.

// message S2CFleaMarketNotification {
//     repeated CardType cardTypes = 1;
//     repeated int32 pickIndex = 2;
// }

// message CharacterStateInfoData {
//     CharacterStateType state = 1;
//     CharacterStateType nextState = 2;
//     int64 nextStateAt = 3; // state가 nextState로 풀리는 밀리초 타임스탬프. state가 NONE이면 0
//     int64 stateTargetUserId = 4; // state에 target이 있을 경우
// }

// 플리마켓 시작됨을 알림
// user는 플리마켓을 선택해야할 유저.
const fleaMarketNotification = (game, user) => {
  const liveUsers = game.getLiveUsers();

  const fleaMarket = game.fleaMarket;

  game.fleaMarket = fleaMarket;

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

    if (user.id === notiUser.id) {
      game.setCharacterState(
        notiUser.id,
        CHARACTER_STATE_TYPE.FLEA_MARKET_TURN,
        CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
        10,
        notiUser.id,
      );
    } else {
      game.setCharacterState(
        notiUser.id,
        CHARACTER_STATE_TYPE.FLEA_MARKET_WAIT,
        CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
        10,
        notiUser.id,
      );
    }
    notiUser.socket.write(noti);
  });
  userUpdateNotification(game);
};

export default fleaMarketNotification;
