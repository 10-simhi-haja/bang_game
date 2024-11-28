import config from '../../config/config.js';
import { createResponse } from '../packet/response/createResponse.js';
import userUpdateNotification from './userUpdateNotification.js';

const animationNotification = (game, animationType, targetUser = null) => {
  const users = game.getAllUsers();
  let responseDate = {
    userId: targetUser.id,
    animationType: config.animationType.NO_ANIMATION,
  };

  switch (animationType) {
    case config.animationType.SHIELD_ANIMATION:
      console.log('자동 실드 애니메이션 동작!');

      responseDate = {
        userId: targetUser.id,
        animationType: animationType,
      };
      break;
    case config.animationType.BOMB_ANIMATION:
      // 폭탄 디버프 가지고 있는 유저 찾기
      const userDatas = game.getAllUserDatas();
      const debuffUserId = userDatas
        .filter((user) => user.character.debuffs.includes(config.card.cardType.BOMB)) // debuffs에 23이 포함된 유저 필터링
        .map((user) => user.id); // 해당 유저의 id만 추출

      const userCharacter = game.getCharacter(debuffUserId[0]);

      if (userCharacter.stateInfo.state === 0) {
        console.log('애니메이션 동작!!!');
        userCharacter.hp -= 2;

        responseDate = {
          userId: debuffUserId[0],
          animationType: animationType,
        };

        game.intervalManager.removeGameIntervalByType(game.id, config.intervalType.BOMB_ANIMATION);
        // userUpdateNotification(game);
      } else {
        console.log('아직 애니메이션 동작 안 하는 중...');
      }
      break;
  }

  users.forEach((notiUser) => {
    const animationNotification = createResponse(
      config.packet.packetType.ANIMATION_NOTIFICATION,
      notiUser.socket.sequence,
      responseDate,
    );

    notiUser.socket.write(animationNotification);
  });
};

export default animationNotification;
