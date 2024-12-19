import config from '../../config/config.js';
import { getGameSessionByUser } from '../../sessions/game.session.js';
import { getUserBySocket } from '../../sessions/user.session.js';
import handleError from '../../utils/errors/errorHandler.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';

const {
  packet: { packetType: PACKET_TYPE },
  globalFailCode: { globalFailCode: GLOBAL_FAIL_CODE },
  character: { characterStateType: CHARACTER_STATE_TYPE },
} = config;

const cardSelectHandler = ({ socket, payload }) => {
  try {
    const user = getUserBySocket(socket);
    const room = getGameSessionByUser(user);
    const { selectType, selectCardType } = payload;
    console.log(`selectType = ${selectType}, selectCardType = ${selectCardType}`);
    // console.log(room.getCharacter(user.id).stateInfo);

    const targetId = room.getCharacter(user.id).stateInfo.stateTargetUserId;
    const target = room.users[targetId].character;
    const userHandCards = room.users[user.id].character.handCards;
    let chooseCard;
    let cardSelectIndex;
    let chooseHandCard;
    let targetCards;
    let range = 0;
    switch (selectType) {
      case 0: // 핸드
        const length = target.handCards.length; // 타겟이 손에 들고 있는 카드의 개수
        range = Math.floor(Math.random() * length);

        chooseCard = userHandCards.find(
          (card) => card.type === target.handCards[range].type, // 타켓의 손에 있는 카드 중, 랜덤으로 선택
        );
        chooseHandCard = target.handCards[range].type;
        targetCards = target.handCards;
        break;
      case 1: // 장비
        cardSelectIndex = target.equips.indexOf(selectCardType);
        chooseCard = userHandCards.find((card) => card.type === target.equips[cardSelectIndex]);
        targetCards = target.equips;
        break;
      case 2: // 무기
        chooseCard = userHandCards.find((card) => card.type === target.weapon);
        targetCards = target.weapon;
        break;
      case 3: // 디버프
        cardSelectIndex = target.debuffs.indexOf(selectCardType);
        chooseCard = userHandCards.find((card) => card.type === target.debuffs[cardSelectIndex]);
        targetCards = target.debuffs;
        break;
    }

    // 흡수: 상대의 카드를 나의 핸드 카드에 추가
    let isAbsorbing = false; // 흡수인지 신기루인지 판별
    if (
      room.getCharacter(user.id).stateInfo.state ===
        config.character.characterStateType.ABSORBING &&
      room.getCharacter(targetId).stateInfo.state ===
        config.character.characterStateType.ABSORB_TARGET
    ) {
      isAbsorbing = true;
      if (chooseCard) {
        chooseCard.count++;
      } else {
        const plusCard = { type: selectCardType === 0 ? chooseHandCard : selectCardType, count: 1 };
        userHandCards.push(plusCard);
      }
    }

    // 카드 삭제
    room.mirage(isAbsorbing, selectType, targetId, selectCardType, targetCards, range);

    room.setCharacterState(
      user.id,
      CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
      CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
      0,
      0,
    );
    room.setCharacterState(
      targetId,
      CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
      CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
      0,
      0,
    );

    const responsePayload = {
      success: true,
      failCode: GLOBAL_FAIL_CODE.NONE_FAILCODE,
    };

    const cardSelectPayload = createResponse(
      PACKET_TYPE.CARD_SELECT_RESPONSE,
      socket.sequence,
      responsePayload,
    );

    socket.write(cardSelectPayload);
  } catch (err) {
    handleError(socket, err);
  }
};

export default cardSelectHandler;
