import config from '../../config/config.js';
import { getGameSessionById } from '../../sessions/game.session.js';
import { getUserBySocket } from '../../sessions/user.session.js';
import { createJoinRoomNotification } from '../../utils/notification/joinRoom.notification.js';
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

    const user = getUserBySocket(socket);
    console.log(`user : ${user.nickname}`);
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

    const opponentUsers = room.getOpponents(user.id);
    console.log(`조인노티 실행전`);

    const allUsers = room.getAllUsers();

    allUsers.forEach((selectUser) => {
      if (selectUser.id === user.id) {
        return;
      }

      const noti = createJoinRoomNotification(userData, selectUser);
      selectUser.socket.write(noti);
    });

    // if (opponentUsers !== null) {
    //   console.log(`조인노티 실행`);
    //   opponentUsers.forEach((user) => {
    //     const noti = createJoinRoomNotification(userData, user);
    //     user.socket.write(noti);
    //   });
    // }
    console.log(`조인노티 실행후`);

    socket.write(joinRoomResponse);
  } catch (error) {
    handleError(socket, error);
  }
};

export default joinRoomHandler;
