import config from '../../config/config.js';
import { createResponse } from '../packet/response/createResponse.js';

const {
  packet: { packetType: PACKET_TYPE },
} = config;

// 페이즈 업데이트 알림
const phaseUpdateNotification = (socket, user, payload) => {
  const noti = createResponse(PACKET_TYPE.PHASE_UPDATE_NOTIFICATION, socket.sequence, payload);
  // message S2CPhaseUpdateNotification {
  //     PhaseType phaseType = 1; // DAY 1, END 3 (EVENING은 필요시 추가)
  //     int64 nextPhaseAt = 2; // 다음 페이즈 시작 시점(밀리초 타임스탬프)
  //     repeated CharacterPositionData characterPositions = 3; // 변경된 캐릭터 위치
  // }

  // const phaseUpdateNotiData = {
  //   phaseType: 1,
  //   nextPhaseAt: 30000,
  //   characterPositions: characterPosData,
  // };

  // const phaseUpdateNoti = createResponse(
  //   PACKET_TYPE.PHASE_UPDATE_NOTIFICATION,
  //   socket.sequence,
  //   phaseUpdateNotiData,
  // );

  // users.forEach((notiUser) => {
  //   notiUser.socket.write(phaseUpdateNoti);
  // });
  user.socket.write(noti);
};

export default phaseUpdateNotification;
