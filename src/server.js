import net from 'net';
import onConnection from './events/onConnection.js';
import initServer from './init/index.js';
import config from './config/config.js';

const server = net.createServer(onConnection);

initServer()
  .then(() => {
    server.listen(config.server.port, config.server.host, () => {
      console.log(`${config.server.host}:${config.server.port}에서 실행`);
      console.log(server.address());
    });
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// test
