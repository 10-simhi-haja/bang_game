import { getGameSessionBySocket, getGameSessionByUser } from '../../sessions/game.session.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';
import { PACKET_TYPE } from '../../constants/header.js';
import handleError from '../../utils/errors/errorHandler.js';
import userUpdateNotification from '../../utils/notification/userUpdateNotification.js';
import { getUserBySocket } from '../../sessions/user.session.js';

const packetType = PACKET_TYPE;

const REACTION_TYPE = {
  NONE_REACTION: 0,
  NOT_USE_CARD: 1,
};

const handleReactionRequest = async ({ socket, payload }) => {
  try {
    console.log('reaction 핸들러 payload', payload);

    if (!payload || typeof payload !== 'object') {
      throw new Error('Payload가 올바르지 않습니다.');
    }

    const { reactionType } = payload;
    console.log('reaction 핸들러 reactionType', reactionType);

    if (!Object.values(REACTION_TYPE).includes(reactionType)) {
      throw new Error('유효하지 않은 리액션 타입입니다.');
    }

    const gameSession = await getGameSessionBySocket(socket);
    if (!gameSession) {
      throw new Error('해당 유저의 게임 세션이 존재하지 않습니다.');
    }

    const user = getUserBySocket(socket);
    const room = getGameSessionByUser(user);
    const users = room.getAllUserDatas();

    if (!room.users || !room.users[user.id]) {
      throw new Error(`User with id ${user.id} not found in room users.`);
    }

    // `reactionType`가 NONE_REACTION이거나 아무 반응이 없는 경우 즉시 피해 적용
    if (reactionType === REACTION_TYPE.NONE_REACTION) {
      console.log(`피해입기를 선택하거나 10초동안 반응이 없어서 ${user.id} 에게 피해를 입힘`);
      if (room.users && room.users[user.id] && room.users[user.id].character.hp > 0) {
        room.users[user.id].character.hp -= 1;
      } else {
        console.error(`User with id ${user.id} not found in room users or already dead.`);
      }
      const userId = user.id;
      const bbangShooter =
        users.find(
          (user) =>
            user.character.stateInfo.stateTargetUserId === userId &&
            user.character.stateInfo.state === 1,
        )?.id || null;
      room.shieldUserStateInfo(bbangShooter, user.id);
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
    console.log('reaction핸들러 작동 끝');
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
