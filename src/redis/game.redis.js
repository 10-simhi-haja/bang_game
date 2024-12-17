import redisManager from '../classes/managers/redis.manager.js';

// 게임 방이 생성되었을 때
export const setGameRedis = async (gameData) => {
  const key = `GAME${gameData.id}:${gameData.id}`;
  const data = gameData;
  await redisManager.getClient().hset(key, data);
  // await redisManager.getClient().hgetall(key);
};

// 게임 방의 상태가 바뀔 때
export const setGameStateRedis = async (gameId, gameState) => {
  const key = `GAME${gameId}:${gameId}`;
  const data = { state: gameState };
  await redisManager.getClient().hset(key, data);
};

export const getGameRedis = async (gameId) => {
  const key = `GAME${gameId}:${gameId}`;
  return await redisManager.getClient().hgetall(key);
};

export const setUserRedis = async (data) => {
  const key = `GAME${data.id}:USER${data.userData.id}`;
  const userData = data.userData;
  await redisManager.getClient().hset(key, {
    ...userData,
    // socket: JSON.stringify(data.userData.socket),
  });
};

export const getUserRedis = async (gameId, userId) => {
  const key = `GAME${gameId}:USER${userId}`;
  const test = await redisManager.getClient().hgetall(key);
  return test;
};

export const setUserPositionRedis = async (gameId, userId, x, y) => {
  const key = `GAME${gameId}:USER${userId}`;
  console.log(`${userId}=> x: ${x}, y: ${y}`);
  await redisManager.getClient().hset(key, {
    x: x,
    y: y,
  });
};

// 유저의 상태가 바뀔 때
export const setUserStateRedis = async (
  gameId,
  userId,
  state,
  nextState,
  nextStateAt,
  stateTargetUserId,
) => {
  const key = `GAME${gameId}:USER${userId}`;
  const userData = {
    state,
    nextState,
    nextStateAt,
    stateTargetUserId,
  };
  await redisManager.getClient().hset(key, userData);
};

export const delUserRedis = async (data) => {
  const key = `GAME${data.id}:USER${data.userData.id}`;
  console.log('이거 동작 안함???: ', key);
  await redisManager.getClient().del(key);
};

export const deleteGameFolderRedis = async (gameId) => {
  const pattern = `GAME${gameId}:*`; // GAME1:* 패턴으로 시작하는 모든 키
  const client = redisManager.getClient();

  // Redis에서 키 패턴 검색 (SCAN 명령어 사용)
  let cursor = 0;
  do {
    const scanResult = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
    cursor = parseInt(scanResult[0], 10); // 다음 SCAN 시작 위치
    const keys = scanResult[1]; // 검색된 키 리스트

    if (keys.length > 0) {
      // 검색된 키들을 삭제
      await client.del(...keys);
    }
  } while (cursor !== 0); // SCAN 완료될 때까지 반복
};
