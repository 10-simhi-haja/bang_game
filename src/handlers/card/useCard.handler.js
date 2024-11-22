import config from '../../config/config.js';
import { PACKET_TYPE } from '../../constants/header.js';
import { getGameSessionByUser } from '../../sessions/game.session.js';
import { getUserBySocket } from '../../sessions/user.session.js';
import handleError from '../../utils/errors/errorHandler.js';
import cardEffectNotification from '../../utils/notification/cardEffectNotification.js';
import equipNotification from '../../utils/notification/equipCardNotification.js';
import useCardNotification from '../../utils/notification/useCardNotification.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';

const {
  card: { cardType: CARD_TYPE },
  globalFailCode: { globalFailCode: GLOBAL_FAIL_CODE },
} = config;

const useCardHandler = ({ socket, payload }) => {
  try {
    const { cardType, targetUserId } = payload; // 사용카드, 타켓userId
    const user = getUserBySocket(socket);
    const room = getGameSessionByUser(user);

    /**
     * TODO: cardType에따라 카드를 사용할 시 그 카드에 따른 효과를 적용해야 함
     * 행동카드를 사용한 유저와 대상이 된 유저는 행동카드 사용이 종료 될 때까지 움직일 수 없고,
     * 다른 유저의 타겟이 될 수 없다.
     * (유저 1이 유저2에게 발포 사용 시 쉴드카드를 사용하거나 사용하지 않을 때 까지 정지 상태,
     * 선택 여부를 결정하는데 주어진 시간을 카드별로 3~5초)
     */
    switch (cardType) {
      case CARD_TYPE.BBANG:
        room.minusBbangCount(user.id); // 사용유저의 빵카운트를 줄임
    }

    const responsePayload = {
      success: true,
      failCode: GLOBAL_FAIL_CODE.NONE_FAILCODE,
    };

    const userCardResponse = createResponse(
      PACKET_TYPE.USE_CARD_RESPONSE,
      socket.sequence,
      responsePayload,
    );

    socket.write(userCardResponse);
    useCardNotification(socket, user.id, room, payload);

    if (cardType >= 13 && cardType <= 20) {
      equipNotification(socket, user.id, room, cardType);
    }
  } catch (err) {
    handleError(socket, err);
  }
};

export default useCardHandler;
