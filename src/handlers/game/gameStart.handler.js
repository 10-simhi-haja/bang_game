import config from '../../config/config.js';
import { getGameSessionByUser } from '../../sessions/game.session.js';
import { getUserBySocket } from '../../sessions/user.session.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';
import ErrorCodes from '../../utils/errors/errorCodes.js';

const {
  packet: { packetType: PACKET_TYPE },
  character: { characterType: CHARACTER_TYPE, characterSpownPoint: CHARACTER_SPOWN_POINT },
  role: { roleType: ROLE_TYPE, rolesDistribution: ROLES_DISTRIBUTION },
} = config;

// message S2CGameStartResponse {
//     bool success = 1;
//     GlobalFailCode failCode = 2;
// }

// 방장이 게임시작을 누르고 역할분배가 완료되면 게임시작 요청이 온다.
// 게임 시작 요청을 받고 모두에게 알림을 보낸다.
export const gameStartRequestHandler = ({ socket, payload }) => {
  try {
    const owner = getUserBySocket(socket);
    const game = getGameSessionByUser(owner);

    // 게임시작 응답 데이터
    const gameStartResponseData = {
      success: true,
      failCode: 0,
    };

    // 게임시작 응답 패킷 생성
    const gameStartResponse = createResponse(
      PACKET_TYPE.GAME_START_RESPONSE,
      socket.sequence,
      gameStartResponseData,
    );

    // 게임시작 응답 패킷 전송
    socket.write(gameStartResponse);

    // 게임 시작 알림.
  } catch (error) {}
};
