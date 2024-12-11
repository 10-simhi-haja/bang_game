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
  const key = `GAME${gameData.id}:${gameId}`;
  const data = {
    state: gameState,
  };

  await redisManager.getClient().hset(key, data);
  //   const test = await redisManager.getClient().hgetall(key);
  //   console.log('레디스 test: ', test);
};

export const setUserRedis = async (data) => {
  const key = `GAME${data.id}:USER${data.userData.id}`;
  const userData = data.userData;

  await redisManager.getClient().hset(key, userData);
  const test = await redisManager.getClient().hgetall(key);
  console.log('레디스 test: ', test);
};
