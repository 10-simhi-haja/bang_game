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
import animationNotification from '../../utils/notification/animationNotification.js';

const {
  packet: { packetType: PACKET_TYPE },
  card: { cardType: CARD_TYPE },
  globalFailCode: { globalFailCode: GLOBAL_FAIL_CODE },
  character: { characterStateType: CHARACTER_STATE_TYPE },
} = config;

const useCardHandler = ({ socket, payload }) => {
  try {
    const { cardType, targetUserId } = payload; // 사용카드, 타켓userId

    const targetId = targetUserId.low;
    const user = getUserBySocket(socket);
    const room = getGameSessionByUser(user);
    const users = room.getAllUserDatas();
    const targetIds = room.getLiveUsersId();
    const userId = user.id;
    console.log(`useCard 실행 ${cardType}, userId: ${userId}, tartgetId: ${targetUserId.low}`);

    const responsePayload = {
      success: true,
      failCode: GLOBAL_FAIL_CODE.NONE_FAILCODE,
    };

    const targetUser = room.getAllUserDatas().find((user) => user.id === targetId);
    const userStateInfo = room.getCharacter(user.id).stateInfo;
    const bbangCount = room.getCharacter(user.id).bbangCount;
    // console.log('살아있는 유저', room.getLiveUsersId());

    switch (cardType) {
      //^ 공격
      case CARD_TYPE.BBANG:
        console.log('빵');
        console.log('userStateInfo :', JSON.stringify(userStateInfo, null, 2));
        console.log('state :', JSON.stringify(userStateInfo.state, null, 2));

        if (userStateInfo.state === 4) {
          console.log('현피중 턴 바꾸기');
          room.setCharacterState(
            user.id,
            CHARACTER_STATE_TYPE.DEATH_MATCH_STATE,
            CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
            3,
            targetId,
          );
          room.setCharacterState(
            targetId,
            CHARACTER_STATE_TYPE.DEATH_MATCH_TURN_STATE,
            CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
            3,
            user.id,
          );
        } else if (userStateInfo.state === 8) {
          console.log('게릴라 방어');
          room.setCharacterState(
            user.id,
            CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
            CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
            0,
            0,
          );
          room.setCharacterState(
            targetId,
            CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
            CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
            0,
            0,
          );
        } else if (bbangCount < 1) {
          const range = Math.floor(Math.random() * 100) + 1; // 1 ~ 100 사이 난수
          const isOutoShield = targetUser.character.equips.includes(
            config.card.cardType.AUTO_SHIELD,
          );
          if (isOutoShield && range <= config.probability.AUTO_SHIELD) {
            console.log('자동 실드가 방어해줌!');
            // 아래 noti가 실행되면 빵야 사용한 사람의 카드가 안 줄어든다.
            animationNotification(room, config.animationType.SHIELD_ANIMATION, targetUser);
            break;
          }
          room.setCharacterState(
            user.id,
            CHARACTER_STATE_TYPE.BBANG_SHOOTER,
            CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
            3,
            targetId,
          );
          room.setCharacterState(
            targetId,
            CHARACTER_STATE_TYPE.BBANG_TARGET,
            CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
            3,
            user.id,
          );
          room.plusBbangCount(user.id); // 사용유저의 빵카운트를 +1
        } else {
          responsePayload.success = false;
          responsePayload.failCode = GLOBAL_FAIL_CODE.ALREADY_USED_BBANG;
        }
        break;
      case CARD_TYPE.BIG_BBANG:
        room.setCharacterState(
          user.id,
          CHARACTER_STATE_TYPE.BIG_BBANG_SHOOTER,
          CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
          3,
          targetId,
        );
        targetIds.forEach((targetId) => {
          room.setCharacterState(
            targetId,
            CHARACTER_STATE_TYPE.BIG_BBANG_TARGET,
            CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
            3,
            user.id,
          );
        });
        break;
      case CARD_TYPE.GUERRILLA:
        console.log('게릴라');
        room.setCharacterState(
          user.id,
          CHARACTER_STATE_TYPE.GUERRILLA_SHOOTER,
          CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
          3,
          targetId,
        );
        targetIds.forEach((targetId) => {
          room.setCharacterState(
            targetId,
            CHARACTER_STATE_TYPE.GUERRILLA_TARGET,
            CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
            3,
            user.id,
          );
        });
        break;
      case CARD_TYPE.DEATH_MATCH:
        console.log('현피');

        room.setCharacterState(
          user.id,
          CHARACTER_STATE_TYPE.DEATH_MATCH_STATE,
          CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
          3,
          targetId,
        );
        room.setCharacterState(
          targetId,
          CHARACTER_STATE_TYPE.DEATH_MATCH_TURN_STATE,
          CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
          3,
          user.id,
        );
        break;

      //^ 방어
      case CARD_TYPE.SHIELD:
        console.log('방어 카드 사용');
        room.setCharacterState(
          user.id,
          CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
          CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
          0,
          0,
        );
        room.setCharacterState(
          targetId,
          CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
          CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
          0,
          0,
        );
        break;
      case CARD_TYPE.VACCINE:
        room.plusHp(user.id);
        break;
      case CARD_TYPE.CALL_119:
        if (targetId !== 0) {
          room.plusHp(targetId);
        } else {
          room.plusAllUsersHp(user.id, users);
        }
        break;

      //^ 유틸
      case CARD_TYPE.ABSORB: // 흡수
        console.log('흡수 발동!: ');
        room.setCharacterState(
          user.id,
          CHARACTER_STATE_TYPE.ABSORBING,
          CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
          3,
          targetId,
        );
        room.setCharacterState(
          targetId,
          CHARACTER_STATE_TYPE.ABSORB_TARGET,
          CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
          3,
          user.id,
        );
        break;
      case CARD_TYPE.HALLUCINATION: // 신기루
        room.setCharacterState(
          user.id,
          CHARACTER_STATE_TYPE.HALLUCINATING,
          CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
          10,
          targetId,
        );
        room.setCharacterState(
          targetId,
          CHARACTER_STATE_TYPE.HALLUCINATION_TARGET,
          CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
          10,
          user.id,
        );

        // ABSORBING = 11;             // 흡수 중
        // ABSORB_TARGET = 12;         // 흡수 대상
        // HALLUCINATING = 13;         // 신기루 중
        // HALLUCINATION_TARGET = 14;  // 신기루 대상
        // CONTAINED = 15;             // 감금 중
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
        room.addbuffs(targetId, cardType);
        room.setBoomUpdateInterval(targetUser);
        break;

      //^ 무기
      case CARD_TYPE.SNIPER_GUN:
      case CARD_TYPE.HAND_GUN:
      case CARD_TYPE.DESERT_EAGLE:
      case CARD_TYPE.AUTO_RIFLE:
        room.addWeapon(user.id, cardType);
        break;

      //^ 장비
      case CARD_TYPE.LASER_POINTER:
        if (!room.getCharacter(user.id).equips.includes(cardType)) {
          room.addEquip(user.id, cardType);
        }
      case CARD_TYPE.RADAR:
        if (!room.getCharacter(user.id).equips.includes(cardType)) {
          room.addEquip(user.id, cardType);
        }
      case CARD_TYPE.AUTO_SHIELD:
        console.log('자동 실드 장착!');
        if (!room.getCharacter(user.id).equips.includes(cardType)) {
          room.addEquip(user.id, cardType);
        }
        break;
      case CARD_TYPE.STEALTH_SUIT:
        // 실제로 에러가 나오면서 장착은 안되지만 클라에선 카드가 소모된 것 처럼 보임, 카드덱을 나갔다가 키면 카드는 존재함
        if (!room.getCharacter(user.id).equips.includes(cardType)) {
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
    // userUpdateNotification(room);

    // 카드 사용 노티피케이션 발송
    useCardNotification(socket, user.id, room, payload);

    // 카드 효과 노티피케이션 발송
    if (cardType >= 13 && cardType <= 20) {
      equipNotification(socket, user.id, room, cardType);
      cardEffectNotification(socket, user.id, room, cardType);
    }

    console.log(responsePayload);
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
