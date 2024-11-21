import config from '../../config/config.js';
import { getGameSessionByUser } from '../../sessions/game.session.js';
import { getUserBySocket } from '../../sessions/user.session.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';
import ErrorCodes from '../../utils/errors/errorCodes.js';
import handleError from '../../utils/errors/errorHandler.js';
import gameStartNotification from '../../utils/notification/gameStartNotification.js';

const {
  packet: { packetType: PACKET_TYPE },
  character: { characterType: CHARACTER_TYPE, characterSpawnPoint: CHARACTER_SPAWN_POINT },
  role: { roleType: ROLE_TYPE, rolesDistribution: ROLES_DISTRIBUTION },
  roomStateType: { wait: WAIT, prepare: PREPARE, inGame: INGAME },
} = config;

// 배열을 중복없이 섞은다음 리턴
// 배열과 숫자 => 배열
// 유틸로 뺄까?
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
    game.changeState(INGAME);

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

    socket.write(gameStartResponse);

    ////////// 리스폰 끝 노티 시작//////

    const allUserDatas = game.getAllUserDatas();
    const characterPos = shuffle(CHARACTER_SPAWN_POINT).slice(0, game.getUserLength());

    game.setAllUserPos(characterPos);
    const characterPosData = game.getAllUserPos();

    // phase 전환시간 밀리초. // 상수화 필요함.
    const gameStateData = {
      phaseType: 1,
      nextPhaseAt: 3000,
    };

    // 게임 시작 알림 데이터
    const gameStartNotiData = {
      gameState: gameStateData,
      users: allUserDatas,
      characterPositions: characterPosData,
    };

    const users = game.getAllUsers();

    users.forEach((notiUser) => {
      gameStartNotification(socket, notiUser, gameStartNotiData);
    });
  } catch (error) {
    handleError(socket, error);
  }
};
