import config from '../../config/config.js';
import { getAllGameSessions, getGameSessionById } from '../../sessions/game.session.js';
import { getUserBySocket } from '../../sessions/user.session.js';
import handleError from '../../utils/errors/errorHandler.js';
import joinRoomNotification from '../../utils/notification/joinRoomNotification.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';

const {
  packet: { packetType: PACKET_TYPE },
  character: { characterType: CHARACTER_TYPE, characterStateType: CHARACTER_STATE_TYPE },
  role: { roleType: ROLE_TYPE, rolesDistribution: ROLES_DISTRIBUTION },
} = config;

const joinRandomRoomHandler = async ({ socket }) => {
  try {
    const allRoom = getAllGameSessions();
    const randomRoomId = allRoom[Math.floor(Math.random() * allRoom.length)];
    const roomId = randomRoomId.id;
    const room = getGameSessionById(roomId);
    const user = getUserBySocket(socket);

    room.addUser(user);

    const defaultCharacterData = {
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
      characterData: defaultCharacterData,
    };

    const responseData = {
      success: true,
      room: room.getRoomData(),
      failcode: 0,
    };

    const joinRandomRoomResponse = createResponse(
      config.packet.packetType.JOIN_RANDOM_ROOM_RESPONSE,
      socket.sequence,
      responseData,
    );

    socket.write(joinRandomRoomResponse);
    joinRoomNotification(socket, user.id, userData, room);
  } catch (error) {
    handleError(socket, error);
  }
};

export default joinRandomRoomHandler;
