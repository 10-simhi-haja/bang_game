import config from '../../config/config.js';
import { PHASE_TYPE } from '../../constants/header.js';
import { createResponse } from '../packet/response/createResponse.js';
import handCardNotification from './handCardsNotification.js';

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
    }
  });

  game.setPhaseUpdateInterval(time);
};

export default phaseUpdateNotification;
