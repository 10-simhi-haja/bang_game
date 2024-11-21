import config from '../../config/config.js';
import { getGameSessionByUser } from '../../sessions/game.session.js';
import { getUserBySocket } from '../../sessions/user.session.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';
import ErrorCodes from '../../utils/errors/errorCodes.js';
import handleError from '../../utils/errors/errorHandler.js';

const {
  packet: { packetType: PACKET_TYPE },
  character: { characterType: CHARACTER_TYPE, characterSpownPoint: CHARACTER_SPOWN_POINT },
  role: { roleType: ROLE_TYPE, rolesDistribution: ROLES_DISTRIBUTION },
  roomStateType: { wait: WAIT, prepare: PREPARE, inGame: INGAME },
} = config;

// 배열을 중복없이 섞은다음 리턴
// 배열과 숫자 => 배열
const shuffle = (array) => {
  // 셔플 가능한지 확인
  if (array === undefined || array === null || array.length <= 1) {
    throw new Error(`섞을수 없는 배열입니다.`);
  }

  const newArray = [...array];

  // 역할 섞기
  for (let i = newArray.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[randomIndex]] = [newArray[randomIndex], newArray[i]];
  }

  return newArray;
};

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

    console.log(`게임시작 요청`);
    // 게임시작 응답 패킷 생성
    const gameStartResponse = createResponse(
      PACKET_TYPE.GAME_START_RESPONSE,
      socket.sequence,
      gameStartResponseData,
    );

    // 게임시작 응답 패킷 전송
    socket.write(gameStartResponse);
    console.log(`게임시작 응답`);

    const allUserDatas = game.getAllUserDatas();
    const characterPos = shuffle(CHARACTER_SPOWN_POINT).slice(0, game.getUserLength());

    // 게임 시작 알림 데이터
    const gameStartNotiData = {
      gameState: INGAME,
      users: allUserDatas,
      characterPositions: characterPos,
    };
    console.log(`게임시작 알림`);

    // 게임시작 알림 패킷 생성
    const gameStartNoti = createResponse(
      PACKET_TYPE.GAME_START_NOTIFICATION,
      socket.sequence,
      gameStartNotiData,
    );

    const users = game.getAllUsers();

    users.forEach((notiUser) => {
      notiUser.socket.write(gameStartNoti);
    });
    console.log(`게임시작 알림 완료`);
  } catch (error) {
    handleError(socket, error);
  }
};
