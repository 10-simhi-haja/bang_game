// import { getGameSessionByUser } from '../../sessions/game.session.js';
// import { getUserBySocket } from '../../sessions/user.session.js';
// import handleError from '../../utils/errors/errorHandler.js';
// import cardEffectNotification from '../../utils/notification/cardEffectNotification.js';
// import equipNotification from '../../utils/notification/equipCardNotification.js';
// import useCardNotification from '../../utils/notification/useCardNotification.js';
// import { createResponse } from '../../utils/packet/response/createResponse.js';
// import userUpdateNotification from '../../utils/notification/userUpdateNotification.js';
// import fleaMarketNotification from '../../utils/notification/fleaMarketNotification.js';
// import FleaMarket from '../../classes/models/fleaMarket.js';
// import animationNotification from '../../utils/notification/animationNotification.js';
import config from '../../../config/config.js';
import { CHARACTER_TYPE } from '../../../constants/header.js';
import animationNotification from '../../notification/animationNotification.js';

const {
  packet: { packetType: PACKET_TYPE },
  card: { cardType: CARD_TYPE },
  globalFailCode: { globalFailCode: GLOBAL_FAIL_CODE },
  character: { characterStateType: CHARACTER_STATE_TYPE },
  probability: PROBABILITY,
  animationType: ANIMATION_TYPE,
  interval: INTERVAL,
} = config;

export const useBbang = (game, user, targetUser, responsePayload) => {
  const userCharacter = game.getCharacter(user.id);
  const targetUserCharacter = game.getCharacter(targetUser.id);
  const userStateInfo = userCharacter.stateInfo;
  const targetId = targetUser.id;

  switch (userStateInfo.state) {
    // 데스매치 일때 빵사용
    case CHARACTER_STATE_TYPE.DEATH_MATCH_TURN_STATE:
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
    // 게릴라전 일때 빵사용
    case CHARACTER_STATE_TYPE.GUERRILLA_TARGET:
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

    default:
      // 기본 빵
      // 빵 횟수를 다썻거나, 맞는쪽이 다른 행동 중이면 쏘지 못함.
      // 감옥에 있는사람은 쏠 수 있어야함.
      if (
        userCharacter.bbangCount < userCharacter.maxBbangCount &&
        (targetUserCharacter.stateInfo.state === CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE ||
          targetUserCharacter.stateInfo.state === CHARACTER_STATE_TYPE.CONTAINED)
      ) {
        game.plusBbangCount(user.id); // 사용유저의 빵카운트를 +1

        // 아이템 자동 실드
        let range = Math.floor(Math.random() * 100) + 1; // 1 ~ 100 사이 난수
        const isOutoShield = targetUser.character.equips.includes(CARD_TYPE.AUTO_SHIELD);
        if (isOutoShield && range <= PROBABILITY.AUTO_SHIELD) {
          // 아래 noti가 실행되면 빵야 사용한 사람의 카드가 안 줄어든다.
          animationNotification(game, ANIMATION_TYPE.SHIELD_ANIMATION, targetUser);
          return;
        }

        // 캐릭터 자동실드
        range = Math.floor(Math.random() * 100) + 1; // 1 ~ 100 사이 난수
        if (
          targetUser.character.characterType === CHARACTER_TYPE.FROGGY &&
          range <= PROBABILITY.AUTO_SHIELD
        ) {
          // 아래 noti가 실행되면 빵야 사용한 사람의 카드가 안 줄어든다.
          animationNotification(game, ANIMATION_TYPE.SHIELD_ANIMATION, targetUser);
          return;
        }

        game.setCharacterState(
          user.id,
          CHARACTER_STATE_TYPE.BBANG_SHOOTER,
          CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
          INTERVAL.ATTACK,
          targetId,
        );
        game.setCharacterState(
          targetId,
          CHARACTER_STATE_TYPE.BBANG_TARGET,
          CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
          INTERVAL.ATTACK,
          user.id,
        );
      } else {
        // 맥스빵보다 커서 못쏨.
        responsePayload.success = false;
        responsePayload.failCode = GLOBAL_FAIL_CODE.ALREADY_USED_BBANG;
      }
      break;
  }
};
