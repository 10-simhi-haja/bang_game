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
    const targeId = targetUserId.low;
    const user = getUserBySocket(socket);
    const room = getGameSessionByUser(user);

    /**
     * TODO: cardType에따라 카드를 사용할 시 그 카드에 따른 효과를 적용해야 함
     * 행동카드를 사용한 유저와 대상이 된 유저는 행동카드 사용이 종료 될 때까지 움직일 수 없고,
     * 다른 유저의 타겟이 될 수 없다.
     * (유저 1이 유저2에게 발포 사용 시 쉴드카드를 사용하거나 사용하지 않을 때 까지 정지 상태,
     * 선택 여부를 결정하는데 주어진 시간을 카드별로 3~5초)
     */

    room.minusHandCardsCount(user.id);
    room.removeCard(user.id, cardType);

    switch (cardType) {
      case CARD_TYPE.BBANG:
        room.plusBbangCount(user.id); // 사용유저의 빵카운트를 +1
        room.BbangShooterStateInfo(user.id, targeId);
        room.BbangTargetStateInfo(targeId);
        break;
      case CARD_TYPE.SHIELD:
        break;

      case CARD_TYPE.VACCINE:
        room.plusHp(user.id);
        break;

      case CARD_TYPE.SNIPER_GUN:
      case CARD_TYPE.HAND_GUN:
      case CARD_TYPE.DESERT_EAGLE:
      case CARD_TYPE.AUTO_RIFLE:
        room.addWeapon(user.id, cardType);
        break;

      case CARD_TYPE.LASER_POINTER:
      case CARD_TYPE.RADAR:
      case CARD_TYPE.AUTO_SHIELD:
      case CARD_TYPE.STEALTH_SUIT:
        room.addEquip(user.id, cardType);
        break;
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
      cardEffectNotification(socket, user.Id, room, cardType);
    }
  } catch (err) {
    handleError(socket, err);
  }
};

export default useCardHandler;

// enum CardType {
//   NONE = 0;
//   BBANG = 1;              // 20장
//   BIG_BBANG = 2;          // 1장
//   SHIELD = 3;             // 10장
//   VACCINE = 4;            // 6장
//   CALL_119 = 5;           // 2장
//   DEATH_MATCH = 6;        // 4장
//   GUERRILLA = 7;          // 1장
//   ABSORB = 8;             // 4장
//   HALLUCINATION = 9;      // 4장
//   FLEA_MARKET = 10;       // 3장
//   MATURED_SAVINGS = 11;   // 2장
//   WIN_LOTTERY = 12;       // 1장
//   SNIPER_GUN = 13;        // 1장
//   HAND_GUN = 14;          // 2장
//   DESERT_EAGLE = 15;      // 3장
//   AUTO_RIFLE = 16;        // 2장
//   LASER_POINTER = 17;     // 1장
//   RADAR = 18;             // 1장
//   AUTO_SHIELD = 19;       // 2장
//   STEALTH_SUIT = 20;      // 2장
//   CONTAINMENT_UNIT = 21;  // 3장
//   SATELLITE_TARGET = 22;  // 1장
//   BOMB = 23;              // 1장
// }
