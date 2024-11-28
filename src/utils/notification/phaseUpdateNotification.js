import config from '../../config/config.js';
import { CARD_TYPE, PHASE_TYPE } from '../../constants/header.js';
import { createResponse } from '../packet/response/createResponse.js';
import handCardNotification from './handCardsNotification.js';
import handleAnimationNotification from './animation.notification.js';
import userUpdateNotification from './userUpdateNotification.js';

const {
  packet: { packetType: PACKET_TYPE },
  interval: INTERVAL,
} = config;

// 페이즈 업데이트 알림
const phaseUpdateNotification = (game) => {
  game.nextPhase();
  let time = 0;

  if (game.phase === PHASE_TYPE.DAY) {
    time = INTERVAL.PHASE_UPDATE_DAY;
  } else if (game.phase === PHASE_TYPE.END) {
    time = INTERVAL.PHASE_UPDATE_END;
  }

  const characterPosData = game.getAllUserPos();

  const phaseUpdateNotiData = {
    phaseType: game.phase,
    nextPhaseAt: Date.now() + time * 1000,
    characterPositions: characterPosData,
  };

  const users = game.getAllUsers();

  users.forEach((notiUser) => {
    const phaseUpdateNoti = createResponse(
      PACKET_TYPE.PHASE_UPDATE_NOTIFICATION,
      notiUser.socket.sequence,
      phaseUpdateNotiData,
    );

    notiUser.socket.write(phaseUpdateNoti);

    if (game.phase === PHASE_TYPE.DAY) {
      const userCharacter = game.getCharacter(notiUser.id);

      if (userCharacter.handCardsCount > userCharacter.hp) {
        const count = userCharacter.handCardsCount - userCharacter.hp;

        // 카드 버리는 부분
        for (let i = 0; i < count; i++) {
          const card = userCharacter.handCards.pop();
          game.cardDeck.addUseCard(card.type); // 버린카드는 사용한 카드더미에 추가
        }
      }

      // 낮이 되어서 카드 뽑는 부분.
      const drawCard = game.cardDeck.drawMultipleCards(2);
      userCharacter.handCards.push(...drawCard);

      handCardNotification(notiUser, game);

      ////////////////////////////////////////////
      // 페이즈가 시작할 때 모든 유저의 정보 조회
      // 방에 들어온 순서대로 유저의 정보 조회
      const userDatas = game.getAllUserDatas();
      userDatas.forEach(({ id, nickname, character }) => {
        const originalUser = game.users[id];

        // 유저가 디버프로 감금장치 장착 시 75퍼센트 확률로 특정 좌표로 이동
        if (character.debuffs.includes(CARD_TYPE.CONTAINMENT_UNIT)) {
          if (Math.random() >= 0.75) {
            originalUser.user.setPos(0, 0);
          }
          // 발동 후 제거
          const index = character.debuffs.indexOf(CARD_TYPE.CONTAINMENT_UNIT);
          if (index !== -1) {
            character.debuffs.splice(index, 1);
          }
        }

        // 디버프 칸에 위성 타겟이 있을 경우
        if (character.debuffs.includes(CARD_TYPE.SATELLITE_TARGET)) {
          const triggerChance = Math.random() < 0.3;

          if (triggerChance) {
            // 효과가 발동되었을 때
            character.hp -= 1;

            handleAnimationNotification({
              socket: originalUser.user.socket,
              payload: {
                userId: originalUser.user.id,
                animationType: 1,
              },
            });
            // 디버프 제거
            const index = character.debuffs.indexOf(CARD_TYPE.SATELLITE_TARGET);
            if (index !== -1) {
              character.debuffs.splice(index, 1);
            }
          } else {
            // 효과가 발동하지 않았을 때 전이
            // 자신의 디버프 제거
            const index = character.debuffs.indexOf(CARD_TYPE.SATELLITE_TARGET);
            if (index !== -1) {
              character.debuffs.splice(index, 1);
            }

            // 다음 살아있는 유저에게 디버프 전이
            try {
              const nextUser = game.getNextUser(id);
              const nextUserId = nextUser.id;
              game.users[nextUserId].character.debuffs.push(CARD_TYPE.SATELLITE_TARGET);
            } catch (err) {
              // 만약 생존 유저가 없으면 로그 출력
              console.error('No surviving users available to transfer the debuff.');
            }
          }
        }

        // 업데이트된 유저 데이터 반영 (필요에 따라)
        game.users[id].character = { ...character };
      });

      // 모든 로직 종료 후 유저 정보 업데이트
      userUpdateNotification(game);
    }
  });

  game.setPhaseUpdateInterval(time);
};

export default phaseUpdateNotification;
