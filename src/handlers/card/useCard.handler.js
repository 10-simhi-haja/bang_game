import config from '../../config/config.js';
import { getGameSessionByUser } from '../../sessions/game.session.js';
import { getUserBySocket } from '../../sessions/user.session.js';
import handleError from '../../utils/errors/errorHandler.js';
import cardEffectNotification from '../../utils/notification/cardEffectNotification.js';
import equipNotification from '../../utils/notification/equipCardNotification.js';
import useCardNotification from '../../utils/notification/useCardNotification.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';
import fleaMarketNotification from '../../utils/notification/fleaMarketNotification.js';
import FleaMarket from '../../classes/models/fleaMarket.js';
import animationNotification from '../../utils/notification/animationNotification.js';
import { useBbang } from '../../utils/util/card/useCardFunction.js';
import { CHARACTER_TYPE } from '../../constants/header.js';
import userUpdateNotification from '../../utils/notification/userUpdateNotification.js';

const {
  packet: { packetType: PACKET_TYPE },
  card: { cardType: CARD_TYPE },
  globalFailCode: { globalFailCode: GLOBAL_FAIL_CODE },
  character: { characterStateType: CHARACTER_STATE_TYPE },
  interval: INTERVAL,
} = config;

const useCardHandler = ({ socket, payload }) => {
  try {
    const { cardType, targetUserId } = payload; // 사용카드, 타켓userId

    const user = getUserBySocket(socket);
    const game = getGameSessionByUser(user);
    const targetId = targetUserId.low;
    const users = game.getAllUserDatas();
    const targetIds = game.getLiveUsersId();
    const userId = user.id;
    console.log(`useCard 실행 ${cardType}, userId: ${userId}, tartgetId: ${targetUserId.low}`);

    const responsePayload = {
      success: true,
      failCode: GLOBAL_FAIL_CODE.NONE_FAILCODE,
    };

    const targetUser = game.getAllUserDatas().find((user) => user.id === targetId);
    const userStateInfo = game.getCharacter(user.id).stateInfo;
    const bbangCount = game.getCharacter(user.id).bbangCount;
    // console.log('살아있는 유저', game.getLiveUsersId());

    switch (cardType) {
      //^ 공격
      case CARD_TYPE.BBANG:
        useBbang(game, user, targetUser, responsePayload);
        break;
      case CARD_TYPE.BIG_BBANG:
        game.setCharacterState(
          user.id,
          CHARACTER_STATE_TYPE.BIG_BBANG_SHOOTER,
          CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
          INTERVAL.ATTACK,
          targetIds,
        );
        console.log(`targetIds: ${targetIds}`);
        targetIds.forEach((targetId) => {
          game.setCharacterState(
            targetId,
            CHARACTER_STATE_TYPE.BIG_BBANG_TARGET,
            CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
            INTERVAL.ATTACK,
            user.id,
          );
          console.log(
            `bigbbang state: ${JSON.stringify(game.getCharacter(targetId).stateInfo, null, 2)}`,
          );
        });
        break;
      case CARD_TYPE.GUERRILLA:
        console.log('게릴라');
        game.setCharacterState(
          user.id,
          CHARACTER_STATE_TYPE.GUERRILLA_SHOOTER,
          CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
          INTERVAL.ATTACK,
          targetIds,
        );

        targetIds.forEach((targetId) => {
          game.setCharacterState(
            targetId,
            CHARACTER_STATE_TYPE.GUERRILLA_TARGET,
            CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
            INTERVAL.ATTACK,
            user.id,
          );
        });
        break;
      case CARD_TYPE.DEATH_MATCH:
        console.log('현피');

        game.setCharacterState(
          user.id,
          CHARACTER_STATE_TYPE.DEATH_MATCH_STATE,
          CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
          INTERVAL.ATTACK,
          targetId,
        );
        game.setCharacterState(
          targetId,
          CHARACTER_STATE_TYPE.DEATH_MATCH_TURN_STATE,
          CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
          INTERVAL.ATTACK,
          user.id,
        );
        break;

      //^ 방어
      case CARD_TYPE.SHIELD:
        console.log('방어 카드 사용');
        // 방어카드 사용
        // 쏜사람이 상어군이나,레이저 조준기 들고 있으면
        // 방어카드 2개 삭제 아래에서 useCard로 삭제하고 있으니
        // 여기서 1개 밑에서 1개 삭제되면 2개
        if (
          (targetUser.character.characterType === CHARACTER_TYPE.SHARK ||
            targetUser.character.equips.includes(CARD_TYPE.LASER_POINTER)) &&
          targetUser.character.stateInfo.state === CHARACTER_STATE_TYPE.BBANG_SHOOTER
        ) {
          game.removeCard(user.id, cardType);
        }

        game.setCharacterState(
          user.id,
          CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
          CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
          0,
          0,
        );
        game.setCharacterState(
          targetId,
          CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
          CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
          0,
          0,
        );
        break;
      case CARD_TYPE.VACCINE:
        game.plusHp(user.id);
        break;
      case CARD_TYPE.CALL_119:
        if (targetId !== 0) {
          game.plusHp(targetId);
        } else {
          game.plusAllUsersHp(user.id, users);
        }
        break;

      //^ 유틸
      case CARD_TYPE.ABSORB: // 흡수
        console.log('흡수 발동!: ');
        game.setCharacterState(
          user.id,
          CHARACTER_STATE_TYPE.ABSORBING,
          CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
          3,
          targetId,
        );
        game.setCharacterState(
          targetId,
          CHARACTER_STATE_TYPE.ABSORB_TARGET,
          CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
          3,
          user.id,
        );
        break;

      case CARD_TYPE.HALLUCINATION: // 신기루
        game.setCharacterState(
          user.id,
          CHARACTER_STATE_TYPE.HALLUCINATING,
          CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
          10,
          targetId,
        );
        game.setCharacterState(
          targetId,
          CHARACTER_STATE_TYPE.HALLUCINATION_TARGET,
          CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
          10,
          user.id,
        );

        break;
      case CARD_TYPE.FLEA_MARKET:
        // 플리마켓 사용하면 플리마켓 노티를 생존한 유저들에게 알림
        const fleaMarket = new FleaMarket(game);
        game.fleaMarket = fleaMarket;
        fleaMarketNotification(game, user);
        break;
      case CARD_TYPE.MATURED_SAVINGS:
        game.MaturedSavings(user.id);
        break;
      case CARD_TYPE.WIN_LOTTERY:
        game.winLottery(user.id);
        break;

      //^ 디버프
      case CARD_TYPE.CONTAINMENT_UNIT:
        game.addbuffs(targetId, cardType);
        break;
      case CARD_TYPE.SATELLITE_TARGET:
        game.addbuffs(targetId, cardType);
        break;
      case CARD_TYPE.BOMB:
        game.addbuffs(targetId, cardType);
        game.setBoomUpdateInterval(targetUser);
        break;

      //^ 무기
      case CARD_TYPE.SNIPER_GUN:
      case CARD_TYPE.HAND_GUN:
      case CARD_TYPE.DESERT_EAGLE:
      case CARD_TYPE.AUTO_RIFLE:
        game.addWeapon(user.id, cardType);
        break;

      //^ 장비
      case CARD_TYPE.LASER_POINTER:
      case CARD_TYPE.RADAR:
      case CARD_TYPE.RADAR:
      case CARD_TYPE.AUTO_SHIELD:
      case CARD_TYPE.STEALTH_SUIT:
        // 실제로 에러가 나오면서 장착은 안되지만 클라에선 카드가 소모된 것 처럼 보임, 카드덱을 나갔다가 키면 카드는 존재함
        if (!game.getCharacter(user.id).equips.includes(cardType)) {
          game.addEquip(user.id, cardType);
        }
        break;
    }

    // 카드 사용 후 카드 삭제 및 유저 업데이트
    // game.minusHandCardsCount(user.id);
    if (responsePayload.success === true) {
      game.removeCard(user.id, cardType);
    }

    // 유저 업데이트 노티피케이션 발송
    // userUpdateNotification(game);

    // 카드 사용 노티피케이션 발송
    useCardNotification(socket, user.id, game, payload);

    // 카드 효과 노티피케이션 발송
    if (cardType >= 13 && cardType <= 20) {
      equipNotification(socket, user.id, game, cardType);
      cardEffectNotification(socket, user.id, game, cardType);
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
