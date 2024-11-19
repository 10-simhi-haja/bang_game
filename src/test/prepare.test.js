import net from 'net';
import { Buffer } from 'buffer';

const configs = {
  packet: {
    totalHeaderLength: 13, // 총 헤더 길이 (타입, 버전, 시퀀스, 페이로드 길이 포함)
    payloadOneofCaseLength: 2, // 패킷 타입 길이
    versionLength: 1, // 버전 길이 (바이트)
    sequenceLength: 4, // 시퀀스 길이 (바이트)
    payloadLength: 4, // 페이로드 길이 (바이트)
  },
  client: {
    version: '1.0.0', // 클라이언트 버전
  },
};

// 패킷 생성 함수
const createPacket = (packetType, sequence, payload) => {
  const version = configs.client.version;
  const versionBuffer = Buffer.from(version, 'utf-8');
  const payloadBuffer = Buffer.from(JSON.stringify(payload), 'utf-8');

  const packetBuffer = Buffer.alloc(configs.packet.totalHeaderLength + payloadBuffer.length);

  let offset = 0;

  // 1. 패킷 타입 (2 bytes)
  packetBuffer.writeUInt16BE(packetType, offset);
  offset += configs.packet.payloadOneofCaseLength;

  // 2. 클라이언트 버전 길이 (1 byte)
  packetBuffer.writeUInt8(versionBuffer.length, offset);
  offset += configs.packet.versionLength;

  // 3. 클라이언트 버전 (N bytes)
  versionBuffer.copy(packetBuffer, offset);
  offset += versionBuffer.length;

  // 4. 패킷 시퀀스 (4 bytes)
  packetBuffer.writeUInt32BE(sequence, offset);
  offset += configs.packet.sequenceLength;

  // 5. 페이로드 길이 (4 bytes)
  packetBuffer.writeUInt32BE(payloadBuffer.length, offset);
  offset += configs.packet.payloadLength;

  // 6. 페이로드 (N bytes)
  payloadBuffer.copy(packetBuffer, offset);

  return packetBuffer;
};

// 클라이언트 생성
const client = new net.Socket();

const HOST = '127.0.0.1';
const PORT = 5555; // 서버 포트 번호
const PACKET_TYPE = 1; // 테스트 패킷 타입
const PAYLOAD = { message: '테스트 메시지' }; // 페이로드

let sequence = 0; // 시퀀스 번호 초기화

client.connect(PORT, HOST, () => {
  console.log(`서버(${HOST}:${PORT})에 연결되었습니다.`);

  // 테스트 패킷 생성 및 전송
  const packet = createPacket(PACKET_TYPE, ++sequence, PAYLOAD);
  client.write(packet);
  console.log('패킷 전송 완료:', packet);
});

client.on('data', (data) => {
  console.log('서버 응답:', data.toString());

  // 연결 종료
  client.end();
});

client.on('error', (err) => {
  console.error('클라이언트 오류:', err);
});

client.on('end', () => {
  console.log('서버와의 연결이 종료되었습니다.');
});
