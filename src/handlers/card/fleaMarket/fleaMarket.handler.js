import config from '../../../config/config.js';
import { GLOBAL_FAIL_CODE } from '../../../constants/header.js';
import { getGameSessionByUser } from '../../../sessions/game.session.js';
import { getUserBySocket } from '../../../sessions/user.session.js';
import handleError from '../../../utils/errors/errorHandler.js';
import fleaMarketNotification from '../../../utils/notification/fleaMarketNotification.js';
import handCardNotification from '../../../utils/notification/handCardsNotification.js';
import userUpdateNotification from '../../../utils/notification/userUpdateNotification.js';
import { createResponse } from '../../../utils/packet/response/createResponse.js';

const {
  packet: { packetType: PACKET_TYPE },
  character: { characterStateType: CHARACTER_STATE_TYPE },
} = config;

// message C2SFleaMarketPickRequest {
//     int32 pickIndex = 1;
// }

// message S2CFleaMarketPickResponse {
//     bool success = 1;
//     GlobalFailCode failCode = 2;
// }

// 캐릭터 스테이트 인포
const defaultStateInfo = {
  state: CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
  nextState: CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
  nextStateAt: 0,
  stateTargetUserId: 0,
};

// 카드 버리기 요청 핸들러
const fleaMarketPickRequestHandler = ({ socket, payload }) => {
  try {
    const { pickIndex } = payload;

    const user = getUserBySocket(socket);
    const game = getGameSessionByUser(user);

    game.fleaMarket.pickCard(user, pickIndex);

    //~ 여기까지 고른 카드를 핸드에 추가함.
    //^ 이제부터 캐릭터 상태 변경. 나는 논으로 넘기고 내 다음유저를 플리마켓 선택으로.

    const responsePayload = {
      success: true,
      failCode: GLOBAL_FAIL_CODE.NONE_FAILCODE,
    };

    const fleaMarketResponse = createResponse(
      PACKET_TYPE.FLEA_MARKET_PICK_RESPONSE,
      socket.sequence,
      responsePayload,
    );

    socket.write(fleaMarketResponse);

    //! 플리마켓 선택
    // 내가 선택한 후 다음 사람이 선택할때 NONE을 거치고 넘어가지 않으면
    // 다른 사람의 화면이 갱신되지 않음.
    // 때문에 NONE을 반드시 거친 다음에 플리마켓 선택 상태로 진입해서 해결.

    game.setAllUserNone();

    if (game.fleaMarket.cards.length > 0) {
      const nextUser = game.getNextUser(user.id);
      fleaMarketNotification(game, nextUser);
    } else {
      // 플리마켓 전부 다하면 이쪽으로
      // 저장해두었던 이전상태와 이전시간바탕으로 계산된 상태를 현재로 돌리고 userUpdate 실행.
      const users = game.getAllUserDatas();
      users.forEach((user) => {
        if (game.users[user.id].prevStateInfo.state !== CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE) {
          const prevState = game.users[user.id].prevStateInfo;

          game.setCharacterState(
            user.id,
            prevState.state,
            prevState.nextState,
            Date.now() + 5 * 1000,
            prevState.stateTargetUserId,
          );
          game.users[user.id].prevStateInfo = { ...defaultStateInfo };
        }
      });

      userUpdateNotification(game);
    }
  } catch (error) {
    handleError(socket, error);
  }
};

export default fleaMarketPickRequestHandler;
