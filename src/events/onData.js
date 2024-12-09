import CustomError from './../utils/errors/customError.js';
import ErrorCodes from './../utils/errors/errorCodes.js';
import config from './../config/config.js';
import validateSequence from './../utils/socket/sequence.js';
import packetParser from './../utils/packet/parser/packetParser.js';
import { getHandlerByPacketType } from './../handlers/index.js';
import handleError from './../utils/errors/errorHandler.js';

// 패킷 우선순위 정의
const PACKET_PRIORITY = {
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

// 패킷 타입별 우선순위 매핑
const getPacketPriority = (packetType) => {
  const { packetType: PACKET_TYPE } = config.packet;

  // 높은 우선순위: 공격, 카드 사용, 리액션 등 즉각적인 응답이 필요한 패킷
  if (
    [
      PACKET_TYPE.USE_CARD_REQUEST,
      PACKET_TYPE.REACTION_REQUEST,
      PACKET_TYPE.PASS_DEBUFF_REQUEST,
    ].includes(packetType)
  ) {
    return PACKET_PRIORITY.HIGH;
  }

  // 중간 우선순위: 게임 상태 변경, 방 참가/퇴장 등
  if (
    [
      PACKET_TYPE.GAME_PREPARE_REQUEST,
      PACKET_TYPE.GAME_START_REQUEST,
      PACKET_TYPE.JOIN_ROOM_REQUEST,
      PACKET_TYPE.LEAVE_ROOM_REQUEST,
    ].includes(packetType)
  ) {
    return PACKET_PRIORITY.MEDIUM;
  }

  // 낮은 우선순위: 위치 업데이트 등 지연 처리 가능한 패킷
  return PACKET_PRIORITY.LOW;
};

class PacketQueue {
  constructor() {
    this.queues = {
      [PACKET_PRIORITY.HIGH]: [],
      [PACKET_PRIORITY.MEDIUM]: [],
      [PACKET_PRIORITY.LOW]: [],
    };
    this.processing = false;
  }

  enqueue(packet) {
    const priority = getPacketPriority(packet.packetType);
    this.queues[priority].push(packet);
    this.processQueue();
  }

  async processQueue() {
    if (this.processing) return;
    this.processing = true;

    try {
      // 우선순위 순서대로 처리
      for (const priority of Object.values(PACKET_PRIORITY)) {
        const queue = this.queues[priority];
        while (queue.length > 0) {
          const packet = queue.shift();
          try {
            const handler = getHandlerByPacketType(packet.packetType);
            await handler(packet);
          } catch (error) {
            handleError(packet.socket, error);
          }
        }
      }
    } finally {
      this.processing = false;
      // 큐에 남은 패킷이 있다면 계속 처리
      if (Object.values(this.queues).some((queue) => queue.length > 0)) {
        this.processQueue();
      }
    }
  }
}

// 소켓별 패킷 큐 저장
const socketQueues = new Map();

const onData = (socket) => async (data) => {
  if (!socket) {
    throw new CustomError(
      ErrorCodes.SOCKET_ERROR,
      `소켓을 찾을 수 없거나 연결이 끊겼다.`,
      socket.sequence,
    );
  }

  socket.buffer = Buffer.concat([socket.buffer, data]);

  const totalHeaderLength = config.packet.totalHeaderLength;
  while (socket.buffer.length >= totalHeaderLength) {
    let offset = 0;
    const packetType = socket.buffer.readUInt16BE(offset);
    offset += config.packet.payloadOneofCaseLength;

    const versionLength = socket.buffer.readUInt8(offset);
    offset += config.packet.versionLength;

    const version = socket.buffer.subarray(offset, offset + versionLength).toString('utf-8');
    offset += versionLength;

    if (version !== config.client.version) {
      throw new CustomError(
        ErrorCodes.CLIENT_VERSION_MISMATCH,
        '클라이언트 버전이 일치하지 않습니다.',
        socket.sequence,
      );
    }

    const sequence = socket.buffer.readUInt32BE(offset);
    offset += config.packet.sequenceLength;
    const isValidSequence = validateSequence(socket, sequence);
    if (!isValidSequence) {
      throw new CustomError(
        ErrorCodes.INVALID_SEQUENCE,
        `패킷이 중복되거나 누락되었다: 예상 시퀀스: ${socket.sequence + 1}, 받은 시퀀스: ${sequence}`,
        socket.sequence,
      );
    }

    const payloadLength = socket.buffer.readUInt32BE(offset);
    offset += config.packet.payloadLength;

    if (socket.buffer.length >= payloadLength + totalHeaderLength) {
      const payloadBuffer = socket.buffer.subarray(offset, offset + payloadLength);

      try {
        const { payload } = packetParser(payloadBuffer);
        socket.buffer = socket.buffer.subarray(offset + payloadLength);

        // 소켓별 패킷 큐 가져오기 또는 생성
        if (!socketQueues.has(socket)) {
          socketQueues.set(socket, new PacketQueue());
        }
        const packetQueue = socketQueues.get(socket);

        // 패킷을 큐에 추가
        packetQueue.enqueue({
          socket,
          packetType,
          payload,
          sequence,
        });

        break;
      } catch (error) {
        handleError(socket, error);
        break;
      }
    } else {
      break;
    }
  }
};

export default onData;
