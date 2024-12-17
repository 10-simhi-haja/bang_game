import config from '../../config/config.js';
import { getUserRedis, setUserRedis } from '../../redis/game.redis.js';
import { getGameSessionById } from '../../sessions/game.session.js';
import { getUserBySocket } from '../../sessions/user.session.js';
import gameStartNotification from '../../utils/notification/gameStartNotification.js';
import joinRoomNotification from '../../utils/notification/joinRoomNotification.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';
import { gameStartRequestHandler } from '../game/gameStart.handler.js';
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

    const userIds = Object.keys(room.users).map((id) => parseInt(id, 10));
    const isInclude = userIds.includes(user.id);

    // 방에 포함되어 있지 않고, 게임이 진행 중이면 들어갈 수 없다.
    if (!isInclude && room.state !== config.roomStateType.wait) {
      return;
    } else if (isInclude) {
      // 방에 포함되어 있고, 게임이 진행 중이면 들어갈 수 있다.
      console.log('이미 입장되어 있다');
      const redisUser = await getUserRedis(room.id, user.id);
      const prevUserSocket = redisUser.socketId;
      console.log(prevUserSocket);

      room.setUsetSocket(user.id, socket);

      await gameStartRequestHandler({ socket });
      return;
    }

    // 게임이 시작 중이거나 역할 분배 중일 땐 들어갈 수 없다.
    if (room.state !== config.roomStateType.wait) return;

    const redisUserData = {
      id: room.id,
      userData: {
        id: user.id,
        socketId: `${socket.remoteAddress}:${socket.remotePort}`,
        // ...defaultStateInfo,
        // socket: user.socket,
      },
    };
    setUserRedis(redisUserData);

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
      failCode: 0,
    };

    const joinRoomResponse = createResponse(
      config.packet.packetType.JOIN_ROOM_RESPONSE,
      socket.sequence,
      responseData,
    );

    socket.write(joinRoomResponse);
    joinRoomNotification(socket, user.id, userData, room);
  } catch (error) {
    handleError(socket, error);
  }
};

export default joinRoomHandler;
