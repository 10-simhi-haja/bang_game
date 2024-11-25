import { getGameSessionBySocket, getGameSessionByUser } from '../../sessions/game.session.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';
import { PACKET_TYPE } from '../../constants/header.js';
import handleError from '../../utils/errors/errorHandler.js';
import userUpdateNotification from '../../utils/notification/userUpdateNotification.js';
import { getUserBySocket } from '../../sessions/user.session.js';

// Packet type constant
const packetType = PACKET_TYPE;

const REACTION_TYPE = {
  NONE_REACTION: 0,
  NOT_USE_CARD: 1,
};

const handleDefenseAction = async (user, room, socket) => {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      // 10초 후 타임 아웃 시 피해 받기 처리
      console.log(`${user.id} 유저가 방어 카드를 사용하지 않아 피해를 받습니다.`);
      if (room.users && room.users[user.id] && room.users[user.id].character.hp > 0) {
        room.users[user.id].character.hp -= 1;
        // 유저 정보 초기화 및 업데이트
        userUpdateNotification(room);
      } else {
        console.error(`User with id ${user.id} not found in room users or already dead.`);
      }
      resolve(false); // 방어 카드 미사용으로 판단
    }, 10000); // 10초 대기

    const defenseResponseHandler = (reactionType) => {
      clearTimeout(timer); // 타이머 멈춤
      if (reactionType === REACTION_TYPE.NOT_USE_CARD) {
        console.log(`Defense card used by user ${user.id}`);
        if (room.users && room.users[user.id]) {
          // 방어 카드 사용 시 피해 받지 않음
          userUpdateNotification(room);
          resolve(true);
        } else {
          console.error(`User with id ${user.id} not found in room users.`);
        }
      } else if (reactionType === REACTION_TYPE.NONE_REACTION) {
        console.log(`No defense card used by user ${user.id}`);
        if (room.users && room.users[user.id] && room.users[user.id].character.hp > 0) {
          room.users[user.id].character.hp -= 1;
          userUpdateNotification(room);
        } else {
          console.error(`User with id ${user.id} not found in room users or already dead.`);
        }
        resolve(false);
      }
    };

    socket.once('defenseResponse', defenseResponseHandler);
  });
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
      console.log('handleReactionRequest - NONE_REACTION 처리');
      if (room.users[user.id].character.hp > 0) {
        room.users[user.id].character.hp -= 1;
        userUpdateNotification(room);
      } else {
        console.error('User is already dead, no further damage will be applied.');
      }
    } else if (reactionType === REACTION_TYPE.NOT_USE_CARD) {
      console.log('handleReactionRequest - NOT_USE_CARD 처리');
      await handleDefenseAction(user, room, socket);
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

      // 모든 유저의 상태를 초기화하며 업데이트 알림
      Object.values(room.users).forEach((roomUser) => {
        roomUser.character.stateInfo.state = 0;
        roomUser.character.stateInfo.nextState = 0;
        roomUser.character.stateInfo.stateTargetUserId = null;
        roomUser.character.stateInfo.nextStateAt = null;
      });

      // 유저 업데이트 알림 호출
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
