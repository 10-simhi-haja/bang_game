import net from 'net';
import onConnection from './events/onConnection.js';
import initServer from './init/index.js';
import config from './config/config.js';

const BASE_PORT = parseInt(process.env.BASE_PORT || 5556, 10); // 기본 시작 포트
const INSTANCE_OFFSET = parseInt(process.env.NODE_APP_INSTANCE || 0, 10); // PM2가 제공하는 인스턴스 번호
const PORT = BASE_PORT + INSTANCE_OFFSET; // 각 인스턴스의 고유 포트

const server = net.createServer(onConnection);

initServer()
  .then(() => {
    server.listen(PORT, config.server.host, () => {
      console.log(`${config.server.host}:${PORT}에서 실행`);
      console.log(server.address());
    });
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
