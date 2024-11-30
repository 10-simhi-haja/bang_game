import config from '../../config/config.js';
import { getGameSessionByUser } from '../../sessions/game.session.js';
import { getUserBySocket } from '../../sessions/user.session.js';
import handleError from '../../utils/errors/errorHandler.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';

const {
  packet: { packetType: PACKET_TYPE },
  card: { cardType: CARD_TYPE },
  globalFailCode: { globalFailCode: GLOBAL_FAIL_CODE },
  character: { characterStateType: CHARACTER_STATE_TYPE },
} = config;

const cardSelectHandler = ({ socket, payload }) => {
  try {
    const user = getUserBySocket(socket);
    const room = getGameSessionByUser(user);
    const { selectType, selectCardType } = payload;
    console.log(`selectType = ${selectType}, selectCardType = ${selectCardType}`);

    const targetId = room.getCharacter(user.id).stateInfo.stateTargetUserId;
    const cards = room.users[targetId].character;
    // console.log(cards);
    let range = 0;
    let length = 0;
    switch (selectType) {
      case 0: // 핸드
        room.handCardHallucination(targetId, room.users[targetId].character.handCards);

        length = cards.handCards.length;
        range = Math.floor(Math.random() * length);

        // console.log('나의 핸드 카드: ', room.users[user.id].character.handCards);
        // console.log('타겟의 핸드 카드: ', cards.handCards);
        // console.log('내가 고른 카드: ', cards.handCards[range].type); // 핸드 카드 중에서 선택...
        // console.log('=====================================');

        const targetCard = room.users[user.id].character.handCards.find(
          (card) => card.type === cards.handCards[range].type,
        );

        if (targetCard) {
          targetCard.count++;
        } else {
          const plusCard = { type: cards.handCards[range].type, count: 1 };
          room.users[user.id].character.handCards.push(plusCard);
        }

        // console.log('현재 나의 핸드 카드: ', room.users[user.id].character.handCards);
        // console.log('현재 타겟의 핸드 카드: ', cards.handCards);
        break;
      case 1: // 장비
        room.equipCardHallucination(
          targetId,
          selectCardType,
          room.users[targetId].character.equips,
        );

        length = cards.equips.length;

        console.log('나의 핸드 카드: ', room.users[user.id].character.handCards);
        console.log('타겟의 장비 카드: ', cards.equips);
        console.log('내가 고른 카드: ', selectCardType); // 장비 카드 중에서 선택...

        const cardSelectIndex = cards.equips.indexOf(selectCardType);
        console.log('내가 고른 카드는 몇 번째에?: ', cardSelectIndex); // 장비 카드 중에서 선택...

        const targetCard2 = room.users[user.id].character.handCards.find(
          (card) => card.type === cards.equips[cardSelectIndex],
        );

        if (targetCard2) {
          targetCard2.count++;
          console.log('잇다!!!');
        } else {
          const plusCard = { type: selectCardType, count: 1 };
          room.users[user.id].character.handCards.push(plusCard);
          console.log('없다!!!');
        }

        console.log('현재 나의 핸드 카드: ', room.users[user.id].character.handCards);
        break;
      case 2: // 무기
        room.weaponCardHallucination(
          targetId,
          selectCardType,
          room.users[targetId].character.weapon,
        );
        room.addWeapon(user.id, 0);
        console.log(cards.weapon);
        break;
      case 3: // 디버프
        room.debuffsCardHallucination(
          targetId,
          selectCardType,
          room.users[targetId].character.debuffs,
        );

        length = cards.debuffs.length;

        console.log('나의 핸드 카드: ', room.users[user.id].character.handCards);
        console.log('타겟의 디버프 카드: ', cards.debuffs);
        console.log('내가 고른 카드: ', selectCardType); // 장비 카드 중에서 선택...

        const cardSelectIndex2 = cards.debuffs.indexOf(selectCardType);
        console.log('내가 고른 카드는 몇 번째에?: ', cardSelectIndex2); // 장비 카드 중에서 선택...

        const targetCard3 = room.users[user.id].character.handCards.find(
          (card) => card.type === cards.debuffs[cardSelectIndex2],
        );

        if (targetCard3) {
          targetCard3.count++;
          console.log('잇다!!!');
        } else {
          const plusCard = { type: selectCardType, count: 1 };
          room.users[user.id].character.handCards.push(plusCard);
          console.log('없다!!!');
        }

        console.log('현재 나의 핸드 카드: ', room.users[user.id].character.handCards);

        console.log(cards.debuffs);
        break;
    }

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
