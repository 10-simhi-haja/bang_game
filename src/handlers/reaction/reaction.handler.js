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

    // 클라이언트에서 낫 유즈 카드 타입을 보내는 조건을 모르겠음
    // 임시 수정 사항 - 쉴드를 사용하면 쉴드 카드 한장을 줄이고 공격 전 상태로 돌림
    // 쉴드가 없거나 피해받기를 누르면 클라이언트에서는 논 리액션 타입으로 보냄
    // 기능은 정상 작동하나 의문점이 많음

    // let defenseUsed = false;
    // let timer = null;
    //
    // // 방어 반응 시 이벤트 핸들러 등록
    // console.log('Registering defenseResponse event listener for socket:', socket.id);
    //
    // socket.once('defenseResponse', (reactionType) => {
    //   console.log('defenseResponse event received:', reactionType);
    //   clearTimeout(timer); // 타이머 멈춤
    //
    //   if (reactionType === REACTION_TYPE.NOT_USE_CARD) {
    //     console.log(`Defense card used by user ${user.id}`);
    //     if (room.users && room.users[user.id]) {
    //       room.resetStateInfoAllUsers();
    //       userUpdateNotification(room);
    //       defenseUsed = true;
    //     } else {
    //       console.error(`User with id ${user.id} not found in room users.`);
    //     }
    //   } else {
    //     console.log(`No defense card used by user ${user.id}`);
    //     if (room.users && room.users[user.id] && room.users[user.id].character.hp > 0) {
    //       room.users[user.id].character.hp -= 1;
    //     } else {
    //       console.error(`User with id ${user.id} not found in room users or already dead.`);
    //     }
    //     room.resetStateInfoAllUsers();
    //     userUpdateNotification(room);
    //   }
    // });

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
