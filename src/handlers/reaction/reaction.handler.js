import { getGameSessionBySocket, getGameSessionByUser } from '../../sessions/game.session.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';
import { CARD_TYPE, CHARACTER_TYPE, PACKET_TYPE } from '../../constants/header.js';
import handleError from '../../utils/errors/errorHandler.js';
import userUpdateNotification from '../../utils/notification/userUpdateNotification.js';
import { getUserBySocket } from '../../sessions/user.session.js';
import animationNotification from '../../utils/notification/animationNotification.js';
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
    if (!payload || typeof payload !== 'object') {
      throw new Error('Payload가 올바르지 않습니다.');
    }

    const { reactionType } = payload;

    if (!Object.values(REACTION_TYPE).includes(reactionType)) {
      throw new Error('유효하지 않은 리액션 타입입니다.');
    }

    const gameSession = await getGameSessionBySocket(socket);
    if (!gameSession) {
      throw new Error('해당 유저의 게임 세션이 존재하지 않습니다.');
    }

    const user = getUserBySocket(socket);
    const game = getGameSessionByUser(user);
    const users = game.getAllUserDatas();
    // 나
    const character = game.getCharacter(user.id);
    console.dir(character, null);
    const attCharacter = game.getCharacter(character.stateInfo.stateTargetUserId);

    if (!game.users || !game.users[user.id]) {
      throw new Error(`User with id ${user.id} not found in game users.`);
    }

    // `reactionType`가 NONE_REACTION일시 피해 적용

    if (reactionType === REACTION_TYPE.NONE_REACTION) {
      // 대미지 받는 부분
      // 데저트 이글 끼고 있으면 2배 데미지
      // 대미지 받고 발동하는 효과 발동
      // 핑크슬라임, 말랑이
      if (character.hp <= 0) {
        console.log(`이미 죽은 유저에게 리액션이 들어왔습니다.`);
        return;
      }

      // 빵일때만 대미지가 2배여야함.
      if (
        attCharacter.weapon === CARD_TYPE.DESERT_EAGLE &&
        character.stateInfo.stateType === CHARACTER_STATE_TYPE.BBANG_TARGET
      ) {
        character.hp -= 2; // 데저트 이글 끼고 빵일때만 대미지 2
        if (CHARACTER_TYPE.MALANG === character.characterType) {
          // 말랑이
          const drawCard = game.cardDeck.drawMultipleCards(2);
          character.handCards.push(...drawCard);
        }
      } else {
        character.hp -= 1; // 그외에는 대미지 1
        if (CHARACTER_TYPE.MALANG === character.characterType) {
          // 말랑이
          const drawCard = game.cardDeck.drawMultipleCards(1);
          character.handCards.push(...drawCard);
        }
      }

      if (
        CHARACTER_TYPE.PINK_SLIME === character.characterType &&
        attCharacter.handCardsCount !== 0
      ) {
        const randomIndex = Math.floor(Math.random() * attCharacter.handCardsCount);

        const [removeCard] = attCharacter.handCards.splice(randomIndex, 1);
        character.handCards.push(removeCard);
      }

      // 리셋을 전체유저에게 하는게 아니라
      // 나랑 나를 공격한 사람을 리셋해야함.
      // game.resetStateInfoAllUsers();
      const target = game.getCharacter(user.id);
      const targetId = target.stateInfo.stateTargetUserId;
      game.setCharacterState(
        user.id,
        CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
        CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
        0,
        0,
      );
      game.setCharacterState(
        game.users[targetId].user.id,
        CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
        CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
        0,
        0,
      );
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
