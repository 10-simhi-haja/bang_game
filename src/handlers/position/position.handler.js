import { getGameSessionBySocket } from '../../sessions/game.session.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';
import config from '../../config/config.js';
import { getUserBySocket } from '../../sessions/user.session.js';
import handleError from '../../utils/errors/errorHandler.js';

const packetType = config.packet.packetType;

// 상수 정의
const UPDATE_INTERVAL = 10;
const MIN_SPEED = 2;
const MAX_SPEED = 5;
const DEFAULT_LATENCY = 100;

// 각 유저의 마지막 위치와 시간을 저장하는 Map
const lastPositions = new Map();
const emptyPacketLatencies = new Map();
let lastUpdateTime = Date.now();

function getLatencyForUser(userId) {
  const latency = emptyPacketLatencies.get(userId);
  return latency !== undefined ? latency / 2 : DEFAULT_LATENCY;
}

function predictPosition(userId, currentTime) {
  const lastPos = lastPositions.get(userId);
  if (!lastPos) return null;

  const timeSinceLastUpdate = currentTime - lastUpdateTime;
  if (timeSinceLastUpdate < UPDATE_INTERVAL) {
    return {
      id: userId,
      x: lastPos.x,
      y: lastPos.y,
      timestamp: lastPos.timestamp,
    };
  }

  const latency = getLatencyForUser(userId);
  const deltaTime = (currentTime - lastPos.timestamp + latency) / 1000;

  if (lastPos.isMoving) {
    const speed = Math.min(
      Math.max(Math.sqrt(lastPos.velocityX ** 2 + lastPos.velocityY ** 2), MIN_SPEED),
      MAX_SPEED,
    );

    const distance = Math.sqrt(lastPos.velocityX ** 2 + lastPos.velocityY ** 2);
    const normalizedVX = distance > 0 ? lastPos.velocityX / distance : 0;
    const normalizedVY = distance > 0 ? lastPos.velocityY / distance : 0;

    const predictedX = lastPos.x + normalizedVX * speed * deltaTime;
    const predictedY = lastPos.y + normalizedVY * speed * deltaTime;

    return {
      id: userId,
      x: predictedX,
      y: predictedY,
      timestamp: currentTime,
      latency: latency,
    };
  }

  return {
    id: userId,
    x: lastPos.x,
    y: lastPos.y,
    timestamp: currentTime,
    latency: latency,
  };
}

// 핸들러는 빈 패킷을 처리하도록 설정
function handleEmptyPacket(socket) {
  const receiveTime = Date.now();

  const responsePacket = createEmptyResponse();
  socket.write(responsePacket, () => {
    const sendTime = Date.now();
    const rtt = sendTime - receiveTime;
    emptyPacketLatencies.set(socket.userId, rtt);
    console.log(`RTT for userId ${socket.userId}: ${rtt} ms`);
  });
}

function createEmptyResponse() {
  return Buffer.from([0x00]); // 실제 전송할 데이터 없이 만드는 응답
}

// 빈 패킷 여부를 확인하는 함수
function isEmptyPacket(data) {
  return data.length === 1 && data[0] === 0x00;
}

const handlePositionUpdate = async ({ socket, payload }) => {
  try {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Payload가 올바르지 않습니다.');
    }

    const { x, y } = payload;
    if (typeof x === 'undefined' || typeof y === 'undefined') {
      throw new Error('페이로드에 x 또는 y 값이 없습니다.');
    }

    const gameSession = getGameSessionBySocket(socket);
    if (!gameSession) {
      throw new Error('해당 유저의 게임 세션이 존재하지 않습니다.');
    }

    const currentUser = getUserBySocket(socket);
    if (!currentUser) {
      throw new Error('유저가 존재하지 않습니다.');
    }

    const currentTime = Date.now();
    const userId = currentUser.id;

    const lastPos = lastPositions.get(userId);

    let isMoving = false;
    let velocityX = 0;
    let velocityY = 0;

    if (lastPos) {
      const dx = x - lastPos.x;
      const dy = y - lastPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0.1) {
        isMoving = true;
        const deltaTime = (currentTime - lastPos.timestamp) / 1000;
        if (deltaTime > 0) {
          velocityX = dx / deltaTime;
          velocityY = dy / deltaTime;
        }
      }
    }

    lastPositions.set(userId, {
      x,
      y,
      velocityX,
      velocityY,
      isMoving,
      timestamp: currentTime,
    });

    currentUser.setPos(x, y);

    if (currentTime - lastUpdateTime < UPDATE_INTERVAL) {
      return;
    }
    lastUpdateTime = currentTime;

    const characterPositions = [];
    const allUsers = gameSession.getAllUsers();

    allUsers.forEach((user) => {
      const posData =
        user.id === userId
          ? { id: userId, x, y, timestamp: currentTime }
          : predictPosition(user.id, currentTime);

      if (posData) {
        characterPositions.push(posData);
      }
    });

    const notiData = { characterPositions };
    const notificationResponse = createResponse(
      packetType.POSITION_UPDATE_NOTIFICATION,
      socket.sequence,
      notiData,
    );

    allUsers.forEach((user) => {
      user.socket.write(notificationResponse);
    });
  } catch (error) {
    handleError(socket, error);
  }
};

export { handleEmptyPacket, isEmptyPacket };
export default handlePositionUpdate;
