import { getGameSessionBySocket, getGameSessionByUser } from '../../sessions/game.session.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';
import { PACKET_TYPE } from '../../constants/header.js';
import handleError from '../../utils/errors/errorHandler.js';
import userUpdateNotification from '../../utils/notification/userUpdateNotification.js';
import { getUserBySocket } from '../../sessions/user.session.js';

const packetType = PACKET_TYPE;

const handleReactionRequest = async ({ socket, payload }) => {
  try {
    console.log('handleReactionRequest - Received payload:', payload);

    if (!payload || typeof payload !== 'object') {
      throw new Error('Payload가 올바르지 않습니다.');
    }

    const { reactionType } = payload;
    console.log('handleReactionRequest - reactionType:', reactionType);

    const REACTION_TYPE = {
      NONE_REACTION: 0,
      NOT_USE_CARD: 1,
    };

    if (!Object.values(REACTION_TYPE).includes(reactionType)) {
      throw new Error('유효하지 않은 리액션 타입입니다.');
    }

    const gameSession = await getGameSessionBySocket(socket);
    if (!gameSession) {
      throw new Error('해당 유저의 게임 세션이 존재하지 않습니다.');
    }
    console.log('handleReactionRequest - gameSession found');

    if (reactionType === REACTION_TYPE.NOT_USE_CARD) {
      console.log('handleReactionRequest - NOT_USE_CARD 처리');
      console.log('handleReactionRequest - After processNotUseCard');
    } else if (reactionType === REACTION_TYPE.NONE_REACTION) {
      // 피해받기 선택 시 동작 & 실드가 없어서 빵야 맞을 때도 동작...
      console.log('handleReactionRequest - NONE_REACTION 처리');
    }

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
      const user = getUserBySocket(socket);
      const room = getGameSessionByUser(user);
      console.log(
        'StateInfo for User 1:',
        JSON.stringify(room.users['1'].character.stateInfo, null, 2),
      );
      room.users['1'].character.stateInfo.state = 0;
      console.log(
        'StateInfo for User 2:',
        JSON.stringify(room.users['2'].character.stateInfo, null, 2),
      );
      room.users['2'].character.stateInfo.state = 0;

      // console.log(`${room.users}의 상태: ${room.users.character}`);

      // room.minusHp(user.id);
      userUpdateNotification(room);
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
