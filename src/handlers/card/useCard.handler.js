import config from '../../config/config.js';
import { getGameSessionByUser } from '../../sessions/game.session.js';
import { getUserBySocket } from '../../sessions/user.session.js';
import handleError from '../../utils/errors/errorHandler.js';
import cardEffectNotification from '../../utils/notification/cardEffectNotification.js';
import equipNotification from '../../utils/notification/equipCardNotification.js';
import useCardNotification from '../../utils/notification/useCardNotification.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';
import userUpdateNotification from '../../utils/notification/userUpdateNotification.js';

const {
  packet: { packetType: PACKET_TYPE },
  card: { cardType: CARD_TYPE },
  globalFailCode: { globalFailCode: GLOBAL_FAIL_CODE },
} = config;

const useCardHandler = ({ socket, payload }) => {
  try {
    console.log('useCard 실행');
    const { cardType, targetUserId } = payload; // 사용카드, 타켓userId
    const targeId = targetUserId.low;
    const user = getUserBySocket(socket);
    const room = getGameSessionByUser(user);

    const responsePayload = {
      success: true,
      failCode: GLOBAL_FAIL_CODE.NONE_FAILCODE,
    };

    /**
     * TODO: cardType에따라 카드를 사용할 시 그 카드에 따른 효과를 적용해야 함
     * 행동카드를 사용한 유저와 대상이 된 유저는 행동카드 사용이 종료 될 때까지 움직일 수 없고,
     * 다른 유저의 타겟이 될 수 없다.
     * (유저 1이 유저2에게 발포 사용 시 쉴드카드를 사용하거나 사용하지 않을 때 까지 정지 상태,
     * 선택 여부를 결정하는데 주어진 시간을 카드별로 3~5초)
     */

    switch (cardType) {
      //^ 공격
      case CARD_TYPE.BBANG:
        room.plusBbangCount(user.id); // 사용유저의 빵카운트를 +1
        room.BbangShooterStateInfo(user.id, targeId);
        room.BbangTargetStateInfo(targeId);
        break;
      case CARD_TYPE.BIG_BBANG:
        break;
      case CARD_TYPE.GUERRILLA:
        break;
      case CARD_TYPE.DEATH_MATCH:
        break;

      //^ 방어
      case CARD_TYPE.SHIELD:
        console.log('방어 카드 사용');
        room.resetStateInfoAllUsers(); // 모든 유저의 상태 초기화 (공격을 사용하기 전으로 돌리는 방식)
        break;
      case CARD_TYPE.VACCINE:
        room.minusHp(user.id); // 테스트를 위해 체력이 깎이게 해놓음
        break;
      case CARD_TYPE.CALL_119:
        //? 나에게, 모두에게 선택하는데 어떻게 받아와서 처리하는지?
        break;

      //^ 유틸
      // case CARD_TYPE.HALLUCINATION:
      case CARD_TYPE.ABSORB:
      case CARD_TYPE.FLEA_MARKET:
      case CARD_TYPE.MATURED_SAVINGS:
      case CARD_TYPE.WIN_LOTTERY:
        break;

      //^ 디버프
      case CARD_TYPE.CONTAINMENT_UNIT:
      case CARD_TYPE.SATELLITE_TARGET:
      case CARD_TYPE.BOMB:
        room.addbuffs(targeId, cardType);
        room.setBoomUpdateInterval();
        break;

      //^ 무기
      case CARD_TYPE.SNIPER_GUN:
      case CARD_TYPE.HAND_GUN:
      case CARD_TYPE.DESERT_EAGLE:
      case CARD_TYPE.AUTO_RIFLE:
        // 실제로 에러가 나오면서 장착은 안되지만 클라에선 카드가 소모된 것 처럼 보임, 카드덱을 나갔다가 키면 카드는 존재함
        try {
          if (room.getCharacter(user.id).weapon === cardType) {
            responsePayload.success = false;
            responsePayload.failCode = GLOBAL_FAIL_CODE.INVALID_REQUEST;
          }
        } catch (err) {
          console.error(err);
        }
        room.addWeapon(user.id, cardType);
        break;

      //^ 장비
      case CARD_TYPE.LASER_POINTER:
      case CARD_TYPE.RADAR:
      case CARD_TYPE.AUTO_SHIELD:
      case CARD_TYPE.STEALTH_SUIT:
        // 실제로 에러가 나오면서 장착은 안되지만 클라에선 카드가 소모된 것 처럼 보임, 카드덱을 나갔다가 키면 카드는 존재함
        // console.log('전', responsePayload);
        if (room.getCharacter(user.id).equips.includes(cardType)) {
          responsePayload.success = false;
          responsePayload.failCode = GLOBAL_FAIL_CODE.INVALID_REQUEST;
        } else {
          room.addEquip(user.id, cardType);
        }
        // console.log('후', responsePayload);

        break;
    }
    // console.log('후', responsePayload);

    // 카드 사용 후 카드 삭제 및 유저 업데이트
    room.minusHandCardsCount(user.id);
    if (responsePayload.success === true) {
      room.removeCard(user.id, cardType);
    }

    // 유저 업데이트 노티피케이션 발송
    userUpdateNotification(room);

    // 카드 사용 노티피케이션 발송
    useCardNotification(socket, user.id, room, payload);

    // 카드 효과 노티피케이션 발송
    if (cardType >= 13 && cardType <= 20) {
      equipNotification(socket, user.id, room, cardType);
      cardEffectNotification(socket, user.id, room, cardType);
    }

    // 카드 사용 응답 전송
    const userCardResponse = createResponse(
      PACKET_TYPE.USE_CARD_RESPONSE,
      socket.sequence,
      responsePayload,
    );

    socket.write(userCardResponse);
    // useCardNotification(socket, user.id, room, payload);
    //
    // room.minusHandCardsCount(user.id);
    // if (responsePayload.success === true) room.removeCard(user.id, cardType);
    //
    // if (cardType >= 13 && cardType <= 20) {
    //   equipNotification(socket, user.id, room, cardType);
    //   cardEffectNotification(socket, user.Id, room, cardType);
    // }
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
