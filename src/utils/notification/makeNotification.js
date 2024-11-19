import config from '../../config/config.js';
import { getFieldNameByHandlerId } from '../../handlers/index.js';
import { getProtoMessages } from '../../init/loadProtos.js';

const {
  packet: {
    payloadOneofCaseLength: PACKET_TYPE_LENGTH,
    versionLength: PACKET_VERSION_LENGTH,
    sequenceLength: PACKET_SEQUENCE_LENGTH,
    payloadLength: PACKET_PAYLOAD_LENGTH,
  },
  client: { version: CLIENT_VERSIONS },
} = config;

/**
 * 중계 패킷 생성
 * @param {*} packetType 패킷타입
 * @param {*} payload 값
 * @param {*} user 유저정보
 * @returns
 */
const makeNotification = (packetType, payload, user) => {
  const packetTypeBuffer = Buffer.alloc(PACKET_TYPE_LENGTH);
  packetTypeBuffer.writeUintBE(packetType, 0, PACKET_TYPE_LENGTH);

  const version = CLIENT_VERSIONS[0];
  const versionBuffer = Buffer.from(version);
  const versionLengthBuffer = Buffer.alloc(PACKET_VERSION_LENGTH);
  versionLengthBuffer.writeUintBE(versionBuffer.length, 0, PACKET_VERSION_LENGTH);

  const sequenceBuffer = Buffer.alloc(PACKET_SEQUENCE_LENGTH);
  sequenceBuffer.writeUintBE(user?.getNextSequence() || 0, 0, PACKET_SEQUENCE_LENGTH);
  const protoMessages = getProtoMessages();
  const fieldName = getFieldNameByHandlerId(packetType);
  const data = {
    payload: fieldName,
    [fieldName]: payload,
  };
  const payloadBuffer = protoMessages.packet.GamePacket.encode(data).finish();

  const payloadLengthBuffer = Buffer.alloc(PACKET_PAYLOAD_LENGTH);
  payloadLengthBuffer.writeUintBE(payloadBuffer.length, 0, PACKET_PAYLOAD_LENGTH);

  return Buffer.concat([
    packetTypeBuffer,
    versionLengthBuffer,
    versionBuffer,
    sequenceBuffer,
    payloadLengthBuffer,
    payloadBuffer,
  ]);
};

export default makeNotification;
