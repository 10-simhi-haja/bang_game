import { getGameSessionBySocket, getGameSessionByUser } from '../../sessions/game.session.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';
import { CARD_TYPE, PACKET_TYPE } from '../../constants/header.js';
import handleError from '../../utils/errors/errorHandler.js';
import userUpdateNotification from '../../utils/notification/userUpdateNotification.js';
import { getUserBySocket } from '../../sessions/user.session.js';

const packetType = PACKET_TYPE;
const cardType = CARD_TYPE;

const REACTION_TYPE = {
  NONE_REACTION: 0,
  NOT_USE_CARD: 1,
};

const handleReactionRequest = async ({ socket, payload }) => {
  try {
    console.log('handleReactionRequest - Received payload:', payload);

    if (!payload || typeof payload !== 'object') {
      throw new Error('Payload가 올바르지 않습니다.');
    }

    const { reactionType } = payload;
    console.log('handleReactionRequest - reactionType:', reactionType);

    if (!Object.values(REACTION_TYPE).includes(reactionType)) {
      throw new Error('유효하지 않은 리액션 타입입니다.');
    }

    const gameSession = await getGameSessionBySocket(socket);
    if (!gameSession) {
      throw new Error('해당 유저의 게임 세션이 존재하지 않습니다.');
    }
    console.log('handleReactionRequest - gameSession found');

    const user = getUserBySocket(socket);
    const room = getGameSessionByUser(user);

    if (!room.users || !room.users[user.id]) {
      throw new Error(`User with id ${user.id} not found in room users.`);
    }

    if (reactionType === REACTION_TYPE.NONE_REACTION) {
      console.log(`Immediate damage processing for user ${user.id}`);

      const character = room.users[user.id]?.character;

      if (character && character.hp > 0) {
        // 방어 장비 AUTO_SHIELD가 장착되어 있는지 확인
        const hasAutoShield = character.equips.includes(CARD_TYPE.AUTO_SHIELD);

        if (hasAutoShield) {
          console.log('AUTO_SHIELD equipped, calculating defense chance...');
          const defenseChance = Math.random();
          if (defenseChance <= 0.25) {
            // 이펙트 문제 해결 못하면 클라이언트 코드 수정 필요
            // await handleAnimationNotification({
            //   socket,
            //   payload: {
            //     userId: user.id,
            //     animationType: 3,
            //   },
            // });
            room.resetStateInfoAllUsers();
            userUpdateNotification(room);

            return;
          }
        }

        // 방어 실패 또는 AUTO_SHIELD 미장착 - 체력 감소
        character.hp -= 1;
        console.log(`Damage applied. New HP for user ${user.id}: ${character.hp}`);
      } else {
        console.error(`User with id ${user.id} not found in room users or already dead.`);
      }

      // 상태 초기화 및 업데이트 알림
      room.resetStateInfoAllUsers();
      userUpdateNotification(room);
    }
    // 리액션 처리 완료 후 응답 전송
    const reactionResponseData = {
      success: true,
      failCode: 0,
    };
    const reactionResponse = createResponse(
      packetType.REACTION_RESPONSE,
      socket.sequence,
      reactionResponseData,
    );
    console.log('handleReactionRequest - Sending response:', reactionResponse);

    if (typeof socket.write === 'function') {
      socket.write(reactionResponse);
    } else {
      throw new Error('socket.write is not a function');
    }
  } catch (error) {
    console.error('리액션 처리 중 에러 발생:', error.message);

    const errorResponse = createResponse(packetType.REACTION_RESPONSE, socket.sequence, {
      success: false,
      failCode: 1,
      message: error.message || 'Reaction failed',
    });

    if (typeof socket.write === 'function') {
      socket.write(errorResponse);
    } else {
      console.error('socket.write is not a function:', socket);
    }

    handleError(socket, error);
  }
};

export default handleReactionRequest;
