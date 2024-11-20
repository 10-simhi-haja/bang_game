import { getGameSessionBySocket } from '../../sessions/game.session.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';
import { PACKET_TYPE, WARNING_TYPE } from '../../constants/header.js';

const packetType = PACKET_TYPE;

// 디버프 전달 요청 핸들러
const handlePassDebuffRequest = async (socket, payload) => {
  try {
    const { targetUserId, debuffCardType } = payload;

    const gameSession = getGameSessionBySocket(socket);
    if (!gameSession) {
      throw new Error('해당 유저의 게임 세션이 존재하지 않습니다.');
    }

    const currentUser = gameSession.users.find((user) => user.socket === socket);
    if (!currentUser) {
      throw new Error('현재 유저가 존재하지 않습니다.');
    }

    const targetUser = gameSession.users.find((user) => user.id === targetUserId);
    if (!targetUser) {
      throw new Error('타겟 유저가 존재하지 않습니다.');
    }

    // 디버프 카드를 전달 로직 추가 (현재 유저의 핸드에서 제거 후 타겟 유저에게 추가)
    const debuffCardIndex = currentUser.character.handCards.findIndex(
      (card) => card.type === debuffCardType,
    );
    if (debuffCardIndex === -1) {
      throw new Error('유저의 핸드에 해당 디버프 카드가 존재하지 않습니다.');
    }

    const [debuffCard] = currentUser.character.handCards.splice(debuffCardIndex, 1);
    targetUser.character.debuffs.push(debuffCard.type);

    // 요청을 보낸 소켓에 성공 여부 보내기
    const passDebuffResponse = createResponse(packetType.PASS_DEBUFF_RESPONSE, socket.sequence, {
      success: true,
      failCode: 0,
    });
    socket.write(passDebuffResponse);

    // 노티피케이션 생성 및 전송
    const notificationData = {
      warningType: WARNING_TYPE,
      expectedAt: Date.now(),
    };

    const notificationResponse = createResponse(
      packetType.WARNING_NOTIFICATION,
      targetUser.socket.sequence,
      notificationData,
    );
    targetUser.socket.write(notificationResponse);
  } catch (error) {
    console.error('디버프 전달 중 에러 발생:', error.message);

    // 요청을 보낸 소켓에 실패 여부 보내기
    const errorResponse = createResponse(packetType.PASS_DEBUFF_RESPONSE, socket.sequence, {
      success: false,
      failCode: 1,
      message: error.message || 'Debuff pass failed',
    });
    socket.write(errorResponse);
  }
};

export default handlePassDebuffRequest;
