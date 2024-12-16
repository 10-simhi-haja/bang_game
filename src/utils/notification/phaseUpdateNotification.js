import config from '../../config/config.js';
import { PHASE_TYPE } from '../../constants/header.js';
import { createResponse } from '../packet/response/createResponse.js';
import handCardNotification from './handCardsNotification.js';
import userUpdateNotification from './userUpdateNotification.js';
import { shuffle } from '../util/shuffle.js';

const {
  packet: { packetType: PACKET_TYPE },
  interval: INTERVAL,
  character: { characterStateType: CHARACTER_STATE_TYPE, missionSpawnPoint: MISSION_SPAWN_POINT },
  card: { cardType: CARD_TYPE },
} = config;

// 페이즈 업데이트 알림
const phaseUpdateNotification = (game) => {
  game.nextPhase();

  const phaseIntervals = {
    [PHASE_TYPE.MISSION]: INTERVAL.PHASE_UPDATE_DAY,
    [PHASE_TYPE.DAY]: INTERVAL.PHASE_UPDATE_END,
    [PHASE_TYPE.END]: INTERVAL.PHASE_UPDATE_MISSION,
  };

  const time = phaseIntervals[game.phase];
  const users = game.getLiveUsers();

  let missionPositions = [];
  if (game.phase === PHASE_TYPE.MISSION) {
    missionPositions = shuffle(MISSION_SPAWN_POINT).slice(0, users.length);

    users.forEach((user, index) => {
      const { x, y } = missionPositions[index];
      user.setPos(x, y);
      user.lastUpdateTime = Date.now();
    });

    // 위치 동기화 알림
    const characterPositions = users.map((user) => ({
      id: user.id,
      x: user.x,
      y: user.y,
    }));

    users.forEach((user) => {
      const positionUpdateNoti = createResponse(
        PACKET_TYPE.POSITION_UPDATE_NOTIFICATION,
        user.socket.sequence,
        { characterPositions },
      );
      users.forEach((user) => user.socket.write(positionUpdateNoti));
    });
  }

  const characterPositions =
    game.phase === PHASE_TYPE.MISSION ? missionPositions : game.getAllUserPos();

  const phaseUpdateNotiData = {
    phaseType: game.phase,
    nextPhaseAt: Date.now() + time * 1000,
    characterPositions,
  };

  users.forEach(async (notiUser) => {
    const phaseUpdateNoti = createResponse(
      PACKET_TYPE.PHASE_UPDATE_NOTIFICATION,
      notiUser.socket.sequence,
      phaseUpdateNotiData,
    );
    notiUser.socket.write(phaseUpdateNoti);

    // 낮일때
    if (game.phase === PHASE_TYPE.DAY) {
      const userCharacter = game.getCharacter(notiUser.id);
      if (userCharacter.hp <= 0) {
        return;
      }

      userCharacter.bbangCount = 0;

      if (userCharacter.handCardsCount > userCharacter.hp) {
        const count = userCharacter.handCardsCount - userCharacter.hp;

        // 카드 버리는 부분
        for (let i = 0; i < count; i++) {
          const card = userCharacter.handCards.pop();
          game.cardDeck.addUseCard(card.type); // 버린카드는 사용한 카드더미에 추가
        }
      }

      // 낮이 되어서 카드 뽑는 부분.
      const drawCard = await game.cardDeck.drawMultipleCards(2);
      userCharacter.handCards.push(...drawCard);
      handCardNotification(notiUser, game);
    }
  });
  if (game.phase === PHASE_TYPE.DAY) {
    game.debuffUpdate();
  }

  game.setPhaseUpdateInterval(time);
};
export default phaseUpdateNotification;
