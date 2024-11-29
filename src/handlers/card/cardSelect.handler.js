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

    switch (selectType) {
      case 0: // 핸드
        room.handCardHallucination(targetId, room.users[targetId].character.handCards);
        break;
      case 1: // 장비
        room.equipCardHallucination(
          targetId,
          selectCardType,
          room.users[targetId].character.equips,
        );
        // console.log(room.users[targetId].character.equips);
        break;
      case 2: // 무기
        room.weaponCardHallucination(
          targetId,
          selectCardType,
          room.users[targetId].character.weapon,
        );
        room.addWeapon(user.id, 0);
        console.log(room.users[targetId].character.weapon);
        break;
      case 3: // 디버프
        room.debuffsCardHallucination(
          targetId,
          selectCardType,
          room.users[targetId].character.debuffs,
        );
        // console.log(room.users[targetId].character.debuffs);
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
