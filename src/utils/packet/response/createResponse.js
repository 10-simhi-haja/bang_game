/** 클라이언트에 응답을 해주기 위한 패킷을 생성해주는 스크립트 */
import config from '../../../config/config.js';
import { getProtoMessages } from '../../../init/loadProtos.js';
import PACKET_MAPS from '../../../protobufs/packetMaps.js';

export const createResponse = (packetType, sequence, payloadData = {}) => {
  // 1. 패킷 타입
  const typeBuffer = Buffer.alloc(config.packet.payloadOneofCaseLength);
  typeBuffer.writeUInt16BE(packetType);
  // 2. 버전
  const versionLengthBuffer = Buffer.alloc(config.packet.versionLength);
  versionLengthBuffer.writeUInt8(config.client.version.length); // 문자열 길이 기록
  // 3. 버전 스트링 길이
  const versionString = config.client.version;
  const versionBuffer = Buffer.from(versionString, 'utf-8');
  // 4. 패킷순서
  const sequenceBuffer = Buffer.alloc(config.packet.sequenceLength);
  sequenceBuffer.writeUInt32BE(sequence); // 예시로 시퀀스 번호 0으로 기록

  const protoMessages = getProtoMessages();
  const gamePacket = protoMessages.packet.GamePacket;
  const responsePayload = {};
  responsePayload[PACKET_MAPS[packetType]] = payloadData;
  const payloadBuffer = gamePacket.encode(responsePayload).finish();

  // 6. 페이로드 길이
  const payloadLengthBuffer = Buffer.alloc(config.packet.payloadLength);
  payloadLengthBuffer.writeUInt32BE(payloadBuffer.length);

  return Buffer.concat([
    typeBuffer,
    versionLengthBuffer,
    versionBuffer,
    sequenceBuffer,
    payloadLengthBuffer,
    payloadBuffer,
  ]);
};
