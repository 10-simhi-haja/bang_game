import config from '../../config/config.js';
import { getGameSessionByUser } from '../../sessions/game.session.js';
import { getUserBySocket } from '../../sessions/user.session.js';
import handleError from '../../utils/errors/errorHandler.js';
import cardEffectNotification from '../../utils/notification/cardEffectNotification.js';
import equipNotification from '../../utils/notification/equipCardNotification.js';
import useCardNotification from '../../utils/notification/useCardNotification.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';
import userUpdateNotification from '../../utils/notification/userUpdateNotification.js';
import fleaMarketNotification from '../../utils/notification/fleaMarketNotification.js';
import FleaMarket from '../../classes/models/fleaMarket.js';

const {
  packet: { packetType: PACKET_TYPE },
  card: { cardType: CARD_TYPE },
  globalFailCode: { globalFailCode: GLOBAL_FAIL_CODE },
} = config;

const useCardHandler = ({ socket, payload }) => {
  try {
    const { cardType, targetUserId } = payload; // 사용카드, 타켓userId
    const targetId = targetUserId.low;
    const user = getUserBySocket(socket);
    const room = getGameSessionByUser(user);
    const users = room.getAllUserDatas();
    const userId = user.id;
    const usersId = [];

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
        console.log(`빵야카드사용시 payload: ${JSON.stringify(payload, null, 2)}`);
        room.plusBbangCount(user.id); // 사용유저의 빵카운트를 +1
        // room.BbangShooterStateInfo(user.id, targetId, 10000);
        // room.BbangTargetStateInfo(targetId, 10000);
        room.bbangStateInfo(user.id, targetId, 10000, room);
        room.shooterPushArr(user.id, targetId);
        break;
      case CARD_TYPE.BIG_BBANG:
        users.forEach((user) => {
          if (user.id !== userId) usersId.push(user.id);
        });
        room.bigBbangStateInfo(user.id, usersId, 10000, room);
        room.shooterPushArr(user.id, usersId);
        break;
      case CARD_TYPE.GUERRILLA:
        users.forEach((user) => {
          if (user.id !== userId) usersId.push(user.id);
        });
        room.GuerrillaStateInfo(user.id, usersId, 10000, room);
        break;
      case CARD_TYPE.DEATH_MATCH:
        users.forEach((user) => {
          if (user.id !== userId) usersId.push(user.id);
        });
        room.DeathMatchStateInfo(user.id, targetId, 10000, room);
        break;

      //^ 방어
      case CARD_TYPE.SHIELD:
        console.log('방어 카드 사용');
        console.log(`쉴드카드사용시 payload: ${JSON.stringify(payload, null, 2)}`);
        //^ find로 하나만 받기
        // const bbangShooter =
        //   users.find(
        //     (user) =>
        //       user.character.stateInfo.stateTargetUserId === targetId &&
        //       user.character.stateInfo.state === 1,
        //   )?.id || null; // find값이 undifined 일 경우 null 반환
        //^ map으로 배열로 받기
        // const bbangShooter = users
        //   .filter(
        //     (user) =>
        //       user.character.stateInfo.stateTargetUserId === targetId &&
        //       user.character.stateInfo.state === 1,
        //   )
        //   .map((user) => user.id);
        room.shieldUserStateInfo(targetId); // (빵을 쏜사람과, 빵을 맞은사람)
        break;
      case CARD_TYPE.VACCINE:
        room.minusHp(user.id); // 테스트를 위해 체력이 깎이게 해놓음
        break;
      case CARD_TYPE.CALL_119:
        if (targetId !== 0) {
          room.plusHp(targetId);
        } else {
          room.plusAllUsersHp(user.id, users);
        }
        break;

      //^ 유틸
      case CARD_TYPE.ABSORB:
        break;
      case CARD_TYPE.HALLUCINATION:
        break;
      case CARD_TYPE.FLEA_MARKET:
        // 플리마켓 사용하면 플리마켓 노티를 생존한 유저들에게 알림
        const fleaMarket = new FleaMarket(room);
        room.fleaMarket = fleaMarket;
        fleaMarketNotification(room, user);
        break;
      case CARD_TYPE.MATURED_SAVINGS:
        room.MaturedSavings(user.id);
        break;
      case CARD_TYPE.WIN_LOTTERY:
        room.winLottery(user.id);
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
        if (room.getCharacter(user.id).equips.includes(cardType)) {
          responsePayload.success = false;
          responsePayload.failCode = GLOBAL_FAIL_CODE.INVALID_REQUEST;
        } else {
          room.addEquip(user.id, cardType);
        }

        break;
    }

    // 카드 사용 후 카드 삭제 및 유저 업데이트
    // room.minusHandCardsCount(user.id);
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
    console.log('userCard핸들러 작동 끝');
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
