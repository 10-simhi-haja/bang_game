import CustomError from './../utils/errors/customError.js';
import ErrorCodes from './../utils/errors/errorCodes.js';
import config from './../config/config.js';
import validateSequence from './../utils/socket/sequence.js';
import packetParser from './../utils/packet/parser/packetParser.js';
import { getHandlerByPacketType } from './../handlers/index.js';
import handleError from './../utils/errors/errorHandler.js';

const moveBuffer = (buffer, offset) => buffer.subarray(offset);

// 중복 패킷이 오면 건너 띈다
const validateRemainingData = (buffer, totalHeaderLength) => {
  if (buffer.length < totalHeaderLength) return false;

  const nextPayloadLength = buffer.readUInt32BE(totalHeaderLength - 4);
  return buffer.length >= totalHeaderLength + nextPayloadLength;
};

const onData = (socket) => async (data) => {
  try {
    if (!socket) {
      throw new CustomError(
        ErrorCodes.SOCKET_ERROR,
        `소켓을 찾을 수 없거나 연결이 끊겼다.`,
        socket.sequence,
      );
    }

    const test = socket.buffer;
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

      const result = validateSequence(socket, sequence);
      switch (result.status) {
        case 'success':
          // 정상
          break;

        case 'duplicate':
          // 중복
          console.error(result.message);
          const duplicatePayloadLength = socket.buffer.readUInt32BE(offset);
          offset += config.packet.payloadLength;
          socket.buffer = moveBuffer(socket.buffer, offset + duplicatePayloadLength);
          continue;

        case 'missing':
          // 누락
          console.error(result.message);
          return;

        default:
          console.error('예상 못한 상황');
          return;
      }

      const payloadLength = socket.buffer.readUInt32BE(offset);
      offset += config.packet.payloadLength;

      if (socket.buffer.length >= payloadLength + totalHeaderLength) {
        const payloadBuffer = socket.buffer.subarray(offset, offset + payloadLength);
        const { payload } = packetParser(payloadBuffer);

        socket.buffer = moveBuffer(socket.buffer, offset + payloadLength);

        const handler = getHandlerByPacketType(packetType);
        await handler({ socket, payload });
      } else {
        break;
      }
    }

    if (socket.buffer.length > 0 && !validateRemainingData(socket.buffer, totalHeaderLength)) {
      console.warn('잔여 데이터가 불완전합니다. 대기합니다.');
    }
  } catch (error) {
    handleError(socket, error);
  }
};

export default onData;
