// import Redis from 'ioredis';
// import config from './config/config.js'; // Redis 설정이 있다면 가져오기

// const redisClient = new Redis({
//   host: config.databases.REDIS_DB.host,
//   port: config.databases.REDIS_DB.port,
//   password: config.databases.REDIS_DB.password,
// });

// redisClient.on('connect', () => {
//   console.log('Redis 연결 성공');
// });
// redisClient.on('error', (err) => {
//   console.error('Redis 연결 실패:', err);
// });

// export default redisClient;

// import { createClient } from 'redis';
// import config from './config/config.js'; // Redis 설정이 있다면 가져오기

// // Redis 클라이언트 생성
// const redisClient = createClient({
//   // url: 'redis://localhost:6379', // 로컬 Redis 컨테이너 주소
//   url: `rediss://${config.databases.REDIS_DB.host}:${config.databases.REDIS_DB.port}`, // Redis 설정
//   // password: config.databases.REDIS_DB.password, // 비밀번호 설정
//   // url: `rediss://${config.databases.REDIS_DB.user}:${config.databases.REDIS_DB.password}@${config.databases.REDIS_DB.host}:${config.databases.REDIS_DB.port}`, // Redis 설정
//   legacyMode: true,
//   socket: {
//     tls: true,
//     rejectUnauthorized: false,
//   },
// });

// // 이벤트 리스너 설정
// redisClient.on('connect', () => console.log('Redis 연결 성공1'));
// redisClient.on('error', (err) => console.error('Redis 연결 실패:', err));

// // 비동기로 Redis 연결
// (async () => {
//   try {
//     await redisClient.connect();
//     console.log('Redis 연결 완료1');
//   } catch (err) {
//     console.error('Redis 연결 중 오류 발생:', err);
//   }
// })();

// export default redisClient;
