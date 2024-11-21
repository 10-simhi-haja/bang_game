/** 클라이언트에 응답을 해주기 위한 패킷을 생성해주는 스크립트 */
import config from '../../../config/config.js';
import { getProtoMessages } from '../../../init/loadProtos.js';
import PACKET_MAPS from '../../../protobufs/packetMaps.js';
import PACKET_MAPS_ERROR_TEST from '../../../protobufs/packetMapsErrorTest.js';

const findMessageSchema = (protoMessages, messageType) => {
  for (const namespace of Object.values(protoMessages)) {
    if (namespace[messageType]) {
      return namespace[messageType];
    }
  }
  return null; // 메시지를 찾지 못한 경우 null 반환
};

export const createResponse = (packetType, sequence, payloadData = {}) => {
  // 1. payloadData가 객체인지 확인
  if (typeof payloadData !== 'object') {
    throw new Error(
      `[createResponse] payloadData가 객체가 아니다. type: ${typeof payloadData}, Value: ${payloadData}`,
    );
  }

  // 2. 패킷 타입에 따른 메시지 타입 이름 가져오기
  const protoMessages = getProtoMessages();
  const messageType = PACKET_MAPS_ERROR_TEST[packetType]; // packetType에 매핑된 메시지 이름
  if (!messageType) {
    throw new Error(`[createResponse] 알 수 없는 패킷: ${packetType}`);
  }

  // 3. 메시지 스키마 찾기 (모든 네임스페이스 탐색)
  const messageSchema = findMessageSchema(protoMessages, messageType);
  if (!messageSchema) {
    throw new Error(
      `[createResponse] 메시지 유형 ${messageType}을 protoMessages에서 찾을 수 없다. 패킷 타입: ${packetType}`,
    );
  }

  // 4. 스키마 필드 검증
  const schemaFields = Object.keys(messageSchema.fields);
  const missingKeys = schemaFields.filter((key) => !(key in payloadData));
  if (missingKeys.length > 0) {
    throw new Error(
      `[createResponse] 잘못된 패킷 타입: ${packetType}, 누락된 필드 값: ${missingKeys.join(', ')}`,
    );
  }

  // 5. 패킷 생성
  const typeBuffer = Buffer.alloc(config.packet.payloadOneofCaseLength);
  typeBuffer.writeUInt16BE(packetType);

  // 6. 버전
  const versionLengthBuffer = Buffer.alloc(config.packet.versionLength);
  versionLengthBuffer.writeUInt8(config.client.version.length);
  // 7. 버전 스트링 길이
  const versionString = config.client.version;
  const versionBuffer = Buffer.from(versionString, 'utf-8');
  // 4. 패킷순서
  const sequenceBuffer = Buffer.alloc(config.packet.sequenceLength);
  sequenceBuffer.writeUInt32BE(sequence);

  const gamePacket = protoMessages.packet.GamePacket;
  const responsePayload = {};
  responsePayload[PACKET_MAPS[packetType]] = payloadData;
  const payloadBuffer = gamePacket.encode(responsePayload).finish();

  if (packetType === 19) {
    console.log('스타트');
    console.log(JSON.stringify(responsePayload, null, 2));
    console.log('스타트2');
    console.dir(gamePacket.decode(payloadBuffer), { depth: null });
  }

  // 6. 페이로드 길이
  const payloadLengthBuffer = Buffer.alloc(config.packet.payloadLength);
  payloadLengthBuffer.writeUInt32BE(payloadBuffer.length);

  console.log(`응답 ${packetType}`);

  if (packetType === 18) {
    console.log(`캐릭터 셔플 응답`);
  }

  if (packetType === 19) {
    console.log(`캐릭터 셔플 노티`);
  }

  return Buffer.concat([
    typeBuffer,
    versionLengthBuffer,
    versionBuffer,
    sequenceBuffer,
    payloadLengthBuffer,
    payloadBuffer,
  ]);
};
