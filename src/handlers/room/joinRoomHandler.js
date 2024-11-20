import config from '../../config/config.js';
import { getGameSessionById } from '../../sessions/game.session.js';
import { getUserBySocket } from '../../sessions/user.session.js';
import joinRoomNotification from '../../utils/notification/joinRoomNotification.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';
import handleError from './../../utils/errors/errorHandler.js';

const {
  packet: { packetType: PACKET_TYPE },
  character: { characterType: CHARACTER_TYPE, characterStateType: CHARACTER_STATE_TYPE },
  role: { roleType: ROLE_TYPE, rolesDistribution: ROLES_DISTRIBUTION },
} = config;

const joinRoomHandler = async ({ socket, payload }) => {
  try {
    const roomId = payload.roomId;
    const room = getGameSessionById(roomId);

    const user = getUserBySocket(socket);

    room.addUser(user);

    const defaultCharacter = {
      characterType: CHARACTER_TYPE.NONE_CHARACTER, // 캐릭터 종류
      roleType: ROLE_TYPE.NONE_ROLE, // 역할 종류
      hp: 0,
      weapon: 0,
      stateInfo: CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE, // 캐릭터 스테이트 타입
      equips: 0,
      debuffs: 0,
      handCards: 0,
      bbangCount: 0,
      handCardsCount: 0,
    };

    const userData = {
      id: user.id,
      nickname: user.nickname,
      character: defaultCharacter,
    };

    const responseData = {
      success: true,
      room: room.getRoomData(),
      failcode: 0,
    };

    const joinRoomResponse = createResponse(
      config.packet.packetType.JOIN_ROOM_RESPONSE,
      socket.sequence,
      responseData,
    );

    socket.write(joinRoomResponse);
    joinRoomNotification(socket, user.id, userData, room);
    console.log(userData);
  } catch (error) {
    handleError(socket, error);
  }
};

export default joinRoomHandler;
