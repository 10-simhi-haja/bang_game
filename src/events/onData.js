import CustomError from './../utils/errors/customError.js';
import ErrorCodes from './../utils/errors/errorCodes.js';
import config from './../config/config.js';
import validateSequence from './../utils/socket/sequence.js';
import packetParser from './../utils/packet/parser/packetParser.js';
import { getHandlerByPacketType } from './../handlers/index.js';
import handleError from './../utils/errors/errorHandler.js';
import { handleEmptyPacket, isEmptyPacket } from '../handlers/position/position.handler.js';

const onData = (socket) => async (data) => {
  if (!socket) {
    throw new CustomError(ErrorCodes.SOCKET_ERROR, `소켓을 찾을 수 없거나 연결이 끊겼다.`);
  }

  if (isEmptyPacket(data)) {
    handleEmptyPacket(socket);
    return;
  }

  socket.buffer = Buffer.concat([socket.buffer, data]);

  const totalHeaderLength = config.packet.totalHeaderLength;
  while (socket.buffer.length >= totalHeaderLength) {
    // 1. 패킷 타입 길이만큼 버퍼 읽을 위치 지정
    let offset = 0;

    // 2. 패킷 타입 - 핸들러 (2 bytes)
    const packetType = socket.buffer.readUInt16BE(offset);
    offset += config.packet.payloadOneofCaseLength; // 2

    // 3. 클라이언트 버전 길이 (1 byte)
    const versionLength = socket.buffer.readUInt8(offset);
    offset += config.packet.versionLength; // 1

    // 4. 클라이언트 버전 (versionLength bytes)
    const version = socket.buffer.subarray(offset, offset + versionLength).toString('utf-8');
    offset += versionLength;
    // 4-1. 버전이 일치하는지 검증
    if (version !== config.client.version) {
      throw new CustomError(
        ErrorCodes.CLIENT_VERSION_MISMATCH,
        '클라이언트 버전이 일치하지 않습니다.',
      );
    }

    // 5. 패킷 시퀀스 (4 bytes)
    const sequence = socket.buffer.readUInt32BE(offset);
    offset += config.packet.sequenceLength;
    const isValidSequence = validateSequence(socket, sequence);
    if (!isValidSequence) {
      throw (
        (new CustomError(ErrorCodes.INVALID_SEQUENCE),
        `패킷이 중복되거나 누락되었다: 예상 시퀀스: ${socket.sequence + 1}, 받은 시퀀스: ${sequence}`)
      );
    }
    // 6. 페이로드 길이 (4 bytes)
    const payloadLength = socket.buffer.readUInt32BE(offset);
    offset += config.packet.payloadLength;

    if (socket.buffer.length >= payloadLength + totalHeaderLength) {
      // 7. 페이로드 (payloadLength bytes)
      const payloadBuffer = socket.buffer.subarray(offset, offset + payloadLength);

      try {
        const { payload } = packetParser(payloadBuffer);

        socket.buffer = socket.buffer.subarray(offset + payloadLength);
        const handler = getHandlerByPacketType(packetType);
        await handler({ socket, payload });
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
