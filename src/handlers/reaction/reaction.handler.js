import { getGameSessionBySocket, getGameSessionByUser } from '../../sessions/game.session.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';
import { CARD_TYPE, PACKET_TYPE } from '../../constants/header.js';
import handleError from '../../utils/errors/errorHandler.js';
import userUpdateNotification from '../../utils/notification/userUpdateNotification.js';
import { getUserBySocket } from '../../sessions/user.session.js';
import handleAnimationNotification from '../../utils/notification/animation.notification.js';

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

    // 클라이언트에서 낫 유즈 카드 타입을 보내는 조건을 모르겠음
    // 임시 수정 사항 - 쉴드를 사용하면 쉴드 카드 한장을 줄이고 공격 전 상태로 돌림
    // 쉴드가 없거나 피해받기를 누르면 클라이언트에서는 논 리액션 타입으로 보냄
    // 기능은 정상 작동하나 의문점이 많음

    // 추측 - 공격을 받으면 25퍼센트 확률로 자동으로 방어가 가능한 캐릭터가 있는데 자동 방어가 활성화 되면
    // 그때 페이로드로 낫 유즈 카드 타입이 오지 않을까
    // 진행 방향 - 특정 캐릭터가 공격을 받았을때 확률로 방어를 자동으로 사용 (핸드에서 방어카드 삭제 x)
    // 방어 카드를 사용했을때와 똑같이 진행을 하면 되지 않을까?
    // if (reactionType === REACTION_TYPE.NOT_USE_CARD) {
    //   console.log('handleReactionRequest - Not use card');
    //   room.resetStateInfoAllUsers();
    //   userUpdateNotification(room);
    //   return;
    // }

    // `reactionType`가 NONE_REACTION이거나 아무 반응이 없는 경우 즉시 피해 적용
    // 쉴드가 없는 유저에게 공격했을때, 쉴드가 있는 유저에게 공격을 했는데 피해 받기를 눌렀을때 클라이언트에게 받는 페이로드
    // 자동방어 장비시 25퍼 확률로

    if (reactionType === REACTION_TYPE.NONE_REACTION) {
      console.log(`Immediate damage processing for user ${user.id}`);

      const character = room.users[user.id]?.character;

      if (character && character.hp > 0) {
        // 방어 장비 AUTO_SHIELD가 장착되어 있는지 확인
        const hasAutoShield = character.equips.includes(CARD_TYPE.AUTO_SHIELD);

        if (hasAutoShield) {
          console.log('AUTO_SHIELD equipped, calculating defense chance...');
          const defenseChance = Math.random();
          if (defenseChance <= 1) {
            // 초기화 시켜보자
            // 안된다
            await handleAnimationNotification({
              socket,
              payload: {
                userId: user.id,
                animationType: 3,
              },
            });
            setTimeout(async () => {
              await handleAnimationNotification({
                socket,
                payload: {
                  userId: user.id,
                  animationType: 0,
                },
              });
              room.resetStateInfoAllUsers();
              userUpdateNotification(room);
            }, 3000);
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
