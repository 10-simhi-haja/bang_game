import config from '../../config/config.js';
import { PHASE_TYPE } from '../../constants/header.js';
import { createResponse } from '../packet/response/createResponse.js';

const {
  packet: { packetType: PACKET_TYPE },
  interval: INTERVAL,
} = config;

// 페이즈 업데이트 알림
const phaseUpdateNotification = (game) => {
  // message S2CPhaseUpdateNotification {
  //     PhaseType phaseType = 1; // DAY 1, END 3 (EVENING은 필요시 추가) // 바꿔줄 페이즈 타입
  //     int64 nextPhaseAt = 2; // 다음 페이즈 시작 시점(밀리초 타임스탬프) // 다음 알림이 시작될 시간.
  //     repeated CharacterPositionData characterPositions = 3; // 변경된 캐릭터 위치
  // }
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
      const drawCard = game.cardDeck.drawMultipleCards(2);
      game.getCharacter(notiUser.id).handCards.push(...drawCard);
    }
  });

  game.setPhaseUpdateInterval(time);
};

export default phaseUpdateNotification;
