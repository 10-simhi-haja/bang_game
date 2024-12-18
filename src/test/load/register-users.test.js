import net from 'net';
import path from 'path';
import protobuf from 'protobufjs';
import { PACKET_TYPE } from '../../constants/header.js';

const HOST = '127.0.0.1';
const PORT = 5555;
const TOTAL_USERS = 700;
const REGISTRATION_DELAY = 100;

class RegistrationClient {
  constructor(id) {
    this.id = id;
    this.socket = new net.Socket();
    this.sequence = 0;
    this.root = null;
    this.GamePacket = null;
  }

  async initializeProtobuf() {
    try {
      this.root = await protobuf.load(
        path.resolve(process.cwd(), 'src/protobufs/common/gamePacket.proto'),
      );
      this.GamePacket = this.root.lookupType('GamePacket');
      console.log(`클라이언트 ${this.id} Protobuf 초기화 완료`);
    } catch (err) {
      console.error(`클라이언트 ${this.id} Protobuf 초기화 오류:`, err);
      throw err;
    }
  }

  createPacket(packetType, payload) {
    const typeBuffer = Buffer.alloc(2);
    typeBuffer.writeUInt16BE(packetType);

    const version = '1.0.0';
    const versionLengthBuffer = Buffer.alloc(1);
    versionLengthBuffer.writeUInt8(version.length);

    const versionBuffer = Buffer.from(version);

    const sequenceBuffer = Buffer.alloc(4);
    sequenceBuffer.writeUInt32BE(++this.sequence);

    const message = this.GamePacket.create({
      registerRequest: payload,
    });
    const payloadBuffer = this.GamePacket.encode(message).finish();

    const payloadLengthBuffer = Buffer.alloc(4);
    payloadLengthBuffer.writeUInt32BE(payloadBuffer.length);

    return Buffer.concat([
      typeBuffer,
      versionLengthBuffer,
      versionBuffer,
      sequenceBuffer,
      payloadLengthBuffer,
      payloadBuffer,
    ]);
  }

  async register() {
    try {
      await this.initializeProtobuf();

      return new Promise((resolve, reject) => {
        this.socket.connect(PORT, HOST, () => {
          console.log(`클라이언트 ${this.id} 연결됨`);

          const registerPayload = {
            email: `test_user_${this.id}@test.com`,
            nickname: `test_user_${this.id}`,
            password: 'testpass',
          };

          console.log(`클라이언트 ${this.id} 회원가입 시도`);
          this.socket.write(this.createPacket(PACKET_TYPE.REGISTER_REQUEST, registerPayload));

          this.socket.once('data', (data) => {
            const response = data.toString();
            console.log(`클라이언트 ${this.id} 회원가입 응답:`, response);
            this.socket.destroy();
            resolve();
          });
        });

        this.socket.on('error', (err) => {
          console.error(`클라이언트 ${this.id} 오류:`, err.message);
          reject(err);
        });
      });
    } catch (err) {
      console.error(`클라이언트 ${this.id} 실행 오류:`, err);
      throw err;
    }
  }
}

async function registerUsers() {
  console.log(`회원가입 시작: 총 ${TOTAL_USERS}명의 사용자 등록`);

  for (let i = 1; i <= TOTAL_USERS; i++) {
    const client = new RegistrationClient(i);
    try {
      await client.register();
      await new Promise((resolve) => setTimeout(resolve, REGISTRATION_DELAY));
    } catch (err) {
      console.error(`사용자 ${i} 등록 실패:`, err);
    }
  }

  console.log('모든 사용자 등록 완료');
}

registerUsers();
