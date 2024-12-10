import net from 'net';
import { getProtoMessages, loadProtos } from '../../src/init/loadProtos.js';

const TOTAL_CONNECTIONS = 5;
const TARGET_PORT = process.env.PORT || 5555;
const TARGET_HOST = process.env.HOST || '127.0.0.1';

const config = {
  packet: {
    totalHeaderLength: 12,
    payloadOneofCaseLength: 2,
    versionLength: 1,
    sequenceLength: 4,
    payloadLength: 4,
  },
  client: {
    version: process.env.CLIENT_VERSION || '1.0.0',
  },
};
let sequence = 1; // 초기값을 1로 설정
let completedConnections = 0;
let successfulConnections = 0;
let failedConnections = 0;

const createGamePacket = (packetType, version, payload) => {
  const headerBuffer = Buffer.alloc(config.packet.totalHeaderLength);
  let offset = 0;

  // Packet type (2 bytes)
  headerBuffer.writeUInt16BE(packetType, offset);
  offset += config.packet.payloadOneofCaseLength;

  // Version length (1 byte)
  headerBuffer.writeUInt8(version.length, offset);
  offset += config.packet.versionLength;

  // Version string
  Buffer.from(version).copy(headerBuffer, offset);
  offset += version.length;

  // Sequence (4 bytes)
  headerBuffer.writeUInt32BE(sequence, offset);
  offset += config.packet.sequenceLength;
  sequence++;

  // Payload length (4 bytes)
  headerBuffer.writeUInt32BE(payload.length, offset);
  offset += config.packet.payloadLength;

  // Combine header and payload
  return Buffer.concat([headerBuffer, payload]);
};

const checkCompletion = () => {
  if (completedConnections === TOTAL_CONNECTIONS) {
    console.log('\nTest completed!');
    console.log('Results:');
    console.log(`Total Connections Attempted: ${TOTAL_CONNECTIONS}`);
    console.log(`Successful Connections: ${successfulConnections}`);
    console.log(`Failed Connections: ${failedConnections}`);
    console.log(`Success Rate: ${((successfulConnections / TOTAL_CONNECTIONS) * 100).toFixed(2)}%`);
  }
};
const runTest = async () => {
  console.log('Loading Protobuf files...');
  await loadProtos();

  console.log('Starting TCP test...');
  console.log(`Target: ${TARGET_HOST}:${TARGET_PORT}`);
  console.log(`Attempting ${TOTAL_CONNECTIONS} connections...\n`);

  // 순차적으로 연결 처리
  for (let i = 0; i < TOTAL_CONNECTIONS; i++) {
    await new Promise((resolve) => {
      const client = new net.Socket();

      client.connect(TARGET_PORT, TARGET_HOST, async () => {
        console.log(`Connection ${i + 1}: Connected successfully`);
        try {
          const packet = await createGamePacket(1); // 모든 연결의 시퀀스를 1로 고정
          client.write(packet);

          // 패킷 전송 후 약간의 대기 시간을 둠
          await new Promise((r) => setTimeout(r, 500));

          successfulConnections++;
        } catch (error) {
          console.error(`Failed to create packet: ${error.message}`);
          failedConnections++;
        }
        client.destroy();
        completedConnections++;
        checkCompletion();
        resolve();
      });

      client.on('error', (err) => {
        console.log(`Connection ${i + 1}: Failed - ${err.message}`);
        failedConnections++;
        completedConnections++;
        checkCompletion();
        resolve();
      });
    });

    // 각 연결 사이의 간격을 1초로 늘림
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};

runTest().catch(console.error);
