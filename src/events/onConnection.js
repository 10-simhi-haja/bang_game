import onData from './onData.js';
import onEnd from './onEnd.js';
import onError from './onError.js';

const onConnection = (socket) => {
  console.log(`클라이언트 연결: ${socket.remoteAddress}:${socket.remotePort}`);

  // 각 클라이언트마다 고유의 버퍼를 유지하기 위해 빈 버퍼 생성
  socket.buffer = Buffer.alloc(0);

  // 각 클라이언트의 패킷순서를 보장하기 위한 순서 생성
  socket.sequence = 0;

  socket.on('data', onData(socket));
  socket.on('end', onEnd(socket));
  socket.on('error', onError(socket));
};

export default onConnection;
