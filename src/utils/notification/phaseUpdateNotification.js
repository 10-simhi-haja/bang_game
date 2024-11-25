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
    time = INTERVAL.PHASE_UPDATE_DAY * 1000;
  } else if (game.phase === PHASE_TYPE.END) {
    time = INTERVAL.PHASE_UPDATE_END * 1000;
  }

  const characterPosData = game.getAllUserPos();

  const phaseUpdateNotiData = {
    phaseType: game.phase,
    nextPhaseAt: Date.now() + time,
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
        for (let i = 0; i < count; i++) {
          const card = userCharacter.handCards.pop();
          game.removeCard(notiUser.id, card.type);
        }
      }

      handCardNotification(notiUser);

      const drawCard = game.cardDeck.drawMultipleCards(2);
      userCharacter.handCards.push(...drawCard);
    }
  });

  game.setPhaseUpdateInterval(time);
};

export default phaseUpdateNotification;
