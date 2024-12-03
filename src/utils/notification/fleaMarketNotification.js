import config from '../../config/config.js';
import { createResponse } from '../packet/response/createResponse.js';
import FleaMarket from '../../classes/models/fleaMarket.js';
import userUpdateNotification from './userUpdateNotification.js';

const {
  packet: { packetType: PACKET_TYPE },
  winType: WIN_TYPE,
  role: { roleType: ROLE_TYPE },
  character: { characterStateType: CHARACTER_STATE_TYPE },
  interval: INTERVAL,
  intervalType: INTERVAL_TYPE,
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

//! 문제점 : 1. 플리마켓이 발동되면 다른사람들 행동이 어떻든 발동되고있음.
//! 문제점 : 2. 인터버매니저에 등록하고 삭제를 안해서 다음 IntervalType이 중복되는게 등록되지 않은이상 계속 호출됨.
// 선택안하면 자동으로 플리마켓 고르고 userUpdate하는 곳
const setFleaMarketPickInterval = (game, user) => {
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

// 플리마켓 시작됨을 알림
// user는 플리마켓을 선택해야할 유저.
const fleaMarketNotification = (game, user) => {
  const liveUsers = game.getLiveUsers();

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

    // 플리마켓 선택자.
    if (user.id === notiUser.id) {
      // 스테이트 변경.
      game.setCharacterState(
        notiUser.id,
        CHARACTER_STATE_TYPE.FLEA_MARKET_TURN,
        CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
        INTERVAL.FLEA_MARKET_PICK,
        notiUser.id,
      );

      //! 선택안할경우를 대비해 자동으로 카드선택후 다음 유저에게 넘기는 것.
      // game.intervalManager.addInterval(
      //   notiUser.id,
      //   () => setFleaMarketPickInterval(game, notiUser),
      //   INTERVAL.FLEA_MARKET_PICK,
      //   INTERVAL_TYPE.CHARACTER_STATE,
      // );
    } else {
      // 선택자이외의 플레이어들 스테이트 변경
      // 만약 None상태가 아니라면
      // 해당 스테이트와 atTime을 저장.
      const notiCharacter = game.getCharacter(notiUser.id);
      if (notiCharacter.stateInfo.state !== CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE) {
        game.users[notiUser.id].prevStateInfo = { ...notiCharacter.stateInfo };
        console.log(
          `none이 아닌 유저다. 이전상태 저장 ${game.users[notiUser.id].prevStateInfo.state}`,
        );
      }

      game.setCharacterState(
        notiUser.id,
        CHARACTER_STATE_TYPE.FLEA_MARKET_WAIT,
        CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
        INTERVAL.FLEA_MARKET_PICK,
        notiUser.id,
      );
    }
    notiUser.socket.write(noti);
  });
  userUpdateNotification(game);
};

export default fleaMarketNotification;
