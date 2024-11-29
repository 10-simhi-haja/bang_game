import { getGameSessionBySocket, getGameSessionByUser } from '../../sessions/game.session.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';
import { PACKET_TYPE } from '../../constants/header.js';
import handleError from '../../utils/errors/errorHandler.js';
import userUpdateNotification from '../../utils/notification/userUpdateNotification.js';
import { getUserBySocket } from '../../sessions/user.session.js';
import config from '../../config/config.js';

const packetType = PACKET_TYPE;
const {
  character: { characterStateType: CHARACTER_STATE_TYPE },
} = config;

const REACTION_TYPE = {
  NONE_REACTION: 0,
  NOT_USE_CARD: 1,
};

const handleReactionRequest = async ({ socket, payload }) => {
  try {
    console.log(`리액션 시작`);

    if (!payload || typeof payload !== 'object') {
      throw new Error('Payload가 올바르지 않습니다.');
    }

    const { reactionType } = payload;
    console.log(`리액션 타입 : ${reactionType}`);

    if (!Object.values(REACTION_TYPE).includes(reactionType)) {
      throw new Error('유효하지 않은 리액션 타입입니다.');
    }

    const gameSession = await getGameSessionBySocket(socket);
    if (!gameSession) {
      throw new Error('해당 유저의 게임 세션이 존재하지 않습니다.');
    }

    const user = getUserBySocket(socket);
    const room = getGameSessionByUser(user);

    if (!room.users || !room.users[user.id]) {
      throw new Error(`User with id ${user.id} not found in room users.`);
    }

    // `reactionType`가 NONE_REACTION이거나 아무 반응이 없는 경우 즉시 피해 적용
    if (reactionType === REACTION_TYPE.NONE_REACTION) {
      console.log(`Immediate damage applied to user ${user.id}`);
      if (room.users && room.users[user.id] && room.users[user.id].character.hp > 0) {
        room.users[user.id].character.hp -= 1;
        console.log(`유저 체력: ${room.users[user.id].character.hp}`);
      } else {
        console.error(`User with id ${user.id} not found in room users or already dead.`);
      }
      // 리셋을 전체유저에게 하는게 아니라
      // 나랑 나를 공격한 사람을 리셋해야함.
      // room.resetStateInfoAllUsers();
      room.setCharacterState(
        user.id,
        CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
        CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
        0,
        0,
      );
      const attackerId = room.users[user.id].attackerId;
      console.log('test: ', room.users[user.id]);
      room.setCharacterState(
        room.users[attackerId].user.id,
        CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
        CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
        0,
        0,
      );
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
