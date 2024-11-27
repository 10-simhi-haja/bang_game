import config from '../../config/config.js';
import { createResponse } from '../packet/response/createResponse.js';
import userUpdateNotification from './userUpdateNotification.js';

const animationNotification = (game, animationType) => {
  switch (animationType) {
    case config.animationType.BOMB_ANIMATION:
      // 폭탄 디버프 가지고 있는 유저 찾기
      const userDatas = game.getAllUserDatas();
      const debuffUserId = userDatas
        .filter((user) => user.character.debuffs.includes(23)) // debuffs에 23이 포함된 유저 필터링
        .map((user) => user.id); // 해당 유저의 id만 추출

      const responseDate = {
        userId: debuffUserId[0],
        animationType: animationType,
      };

      const userCharacter = game.getCharacter(debuffUserId[0]);

      if (userCharacter.stateInfo.state === 0) {
        console.log('애니메이션 동작!!!');
        console.log(userCharacter.hp);
        userCharacter.hp -= 2;
        console.log(userCharacter.hp);

        const users = game.getAllUsers();
        users.forEach((notiUser) => {
          const animationNotification = createResponse(
            config.packet.packetType.ANIMATION_NOTIFICATION,
            notiUser.socket.sequence,
            responseDate,
          );

          notiUser.socket.write(animationNotification);
        });

        game.intervalManager.removeGameIntervalByType(game.id, config.intervalType.BOMB_ANIMATION);
        userUpdateNotification(game);
      } else {
        console.log('아직 애니메이션 동작 안 하는 중...');
      }
      break;
  }
};

export default animationNotification;
