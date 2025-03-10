import config from '../../config/config.js';
import { getGameSessionByUser } from '../../sessions/game.session.js';
import { getUserBySocket } from '../../sessions/user.session.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';
import handleError from '../../utils/errors/errorHandler.js';
import gameStartNotification from '../../utils/notification/gameStartNotification.js';
import { shuffle } from '../../utils/util/shuffle.js';
import { loadSpawnPoint } from '../../database/character/spawnPoint.db.js';
import { getGameRedis, setGameRedis, setGameStateRedis } from '../../redis/game.redis.js';

const {
  packet: { packetType: PACKET_TYPE },
  // character: { characterType: CHARACTER_TYPE, characterSpawnPoint: CHARACTER_SPAWN_POINT },
  role: { roleType: ROLE_TYPE, rolesDistribution: ROLES_DISTRIBUTION },
  roomStateType: { wait: WAIT, prepare: PREPARE, inGame: INGAME },
  interval: INTERVAL,
  intervalType: INTERVAL_TYPE,
} = config;

// 방장이 게임시작을 누르고 역할분배가 완료되면 게임시작 요청이 온다.
// 게임 시작 요청을 받고 모두에게 알림을 보낸다.
export const gameStartRequestHandler = async ({ socket, payload }) => {
  try {
    const owner = getUserBySocket(socket);
    const game = getGameSessionByUser(owner);
    game.changeState(INGAME);
    setGameStateRedis(game.id, INGAME);

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
    const spawDate = await loadSpawnPoint();
    const characterPos = shuffle(spawDate).slice(0, game.getUserLength());
    // console.log('게임 내 유저: ', allUserDatas);

    game.setAllUserPos(characterPos);
    const characterPosData = game.getAllUserPos();

    // phase 전환시간 밀리초. // 상수화 필요함.
    const time = INTERVAL.PHASE_UPDATE_DAY;
    const gameStateData = {
      phaseType: 1,
      nextPhaseAt: Date.now() + time * 1000, // 단위  1초
    };

    const redisData = {
      id: game.id,
      users: game.userOrder,
      nextPhaseAt: gameStateData.nextPhaseAt,
    };
    setGameRedis(redisData);

    // 게임 시작 알림 데이터
    const gameStartNotiData = {
      gameState: gameStateData,
      users: allUserDatas,
      characterPositions: characterPosData,
    };

    const users = game.getAllUsers();

    users.forEach((notiUser) => {
      if (notiUser.socket === socket) {
        // 새로 연결된 소켓인지 확인
        console.log('게임 시작 알림 전송: ', notiUser.nickname);
      }

      gameStartNotification(socket, notiUser, gameStartNotiData);
    });
    // 모든 유저마다 만들어 줄 필요는 없음.
    game.setUserSyncInterval();
    // 페이즈 넘어가는 시간 넣어야함

    game.setPhaseUpdateInterval(time);
    game.setGameUpdateInterval();
  } catch (error) {
    handleError(socket, error);
  }
};
