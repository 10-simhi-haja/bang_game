import net from 'net';
import path from 'path';
import protobuf from 'protobufjs';
import { PACKET_TYPE } from '../../constants/header.js';

const HOST = '52.79.226.3';
const PORT = 5555;
const ROOMS_COUNT = 14; // 방 개수
const PLAYERS_PER_ROOM = 7; // 방당 플레이어 수
const TOTAL_CLIENTS = ROOMS_COUNT * PLAYERS_PER_ROOM; // 총 클라이언트 수
const CONNECTION_DELAY = 100;
const TEST_DURATION = 600000; // 테스트 지속 시간 (1분)
const RESPONSE_TIMEOUT = 5000; // 응답 타임아웃 (5초)

class TestClient {
  constructor(id) {
    this.id = id;
    this.socket = new net.Socket();
    this.sequence = 0;
    this.buffer = Buffer.alloc(0);
    this.root = null;
    this.GamePacket = null;
    this.isLoggedIn = false;
    this.roomId = Math.floor((id - 1) / PLAYERS_PER_ROOM) + 1;
    this.isRoomOwner = (id - 1) % PLAYERS_PER_ROOM === 0;

    // 통계 데이터
    this.stats = {
      latency: {
        sum: 0,
        count: 0,
        max: 0,
        min: Infinity,
      },
      packets: {
        sent: 0,
        received: 0,
        lost: 0,
      },
      errors: {
        count: 0,
        messages: [],
      },
      connectionTime: null,
      disconnectionTime: null,
      lastPacketTime: null,
      isConnected: false,
    };

    // 소켓 이벤트 핸들러 설정
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.socket.on('connect', () => {
      this.stats.connectionTime = Date.now();
      this.stats.isConnected = true;
      console.log(`[Client ${this.id}] 연결 성공`);
      this.startGameFlow().catch((err) => {
        console.error(`[Client ${this.id}] 게임 플로우 시작 실패:`, err.message);
      });
    });

    this.socket.on('close', () => {
      this.stats.disconnectionTime = Date.now();
      this.stats.isConnected = false;
      console.log(`[Client ${this.id}] 연결 종료`);
    });

    this.socket.on('error', (err) => {
      this.recordError(`연결 오류: ${err.message}`);
      console.error(`[Client ${this.id}] 오류:`, err.message);
    });

    this.socket.on('data', (data) => {
      this.stats.lastPacketTime = Date.now();
      this.buffer = Buffer.concat([this.buffer, data]);
      this.processBuffer();
    });
  }

  processBuffer() {
    try {
      while (this.buffer.length >= 11) {
        // 최소 헤더 크기
        // 패킷 타입 (2바이트)
        const packetType = this.buffer.readUInt16BE(0);

        // 버전 ���이 (1바이트)
        const versionLength = this.buffer.readUInt8(2);

        // 시퀀스 (4바이트)
        const sequence = this.buffer.readUInt32BE(3 + versionLength);

        // 페이로드 길이 (4바이트)
        const payloadLength = this.buffer.readUInt32BE(7 + versionLength);

        // 전체 패킷 길이가 충분한지 확인
        const totalLength = 11 + versionLength + payloadLength;
        if (this.buffer.length < totalLength) {
          break;
        }

        // 응답 이벤트 발생
        this.socket.emit('data_processed', this.buffer.slice(0, totalLength));

        // 처리된 데이터 제거
        this.buffer = this.buffer.slice(totalLength);
      }
    } catch (err) {
      this.recordError(`패킷 처리 오류: ${err.message}`);
      this.buffer = Buffer.alloc(0);
    }
  }

  async initializeProtobuf() {
    try {
      console.log(`[Client ${this.id}] Protobuf 초기화 시작`);
      this.root = await protobuf.load(
        path.resolve(process.cwd(), 'src/protobufs/common/gamePacket.proto'),
      );
      this.GamePacket = this.root.lookupType('GamePacket');
      console.log(`[Client ${this.id}] Protobuf 초기화 완료`);
    } catch (err) {
      this.recordError('Protobuf 초기화 오류: ' + err.message);
      console.error(`[Client ${this.id}] Protobuf 초기화 실패:`, err);
      throw err;
    }
  }

  recordPacketSent() {
    this.stats.packets.sent++;
    console.log(`[Client ${this.id}] 패킷 전송 (총 ${this.stats.packets.sent}개)`);
  }

  recordPacketReceived(latency) {
    this.stats.packets.received++;
    this.stats.latency.sum += latency;
    this.stats.latency.count++;
    this.stats.latency.max = Math.max(this.stats.latency.max, latency);
    this.stats.latency.min = Math.min(this.stats.latency.min, latency);
    console.log(`[Client ${this.id}] 패킷 수신 (레이턴시: ${latency}ms)`);
  }

  recordPacketLost() {
    this.stats.packets.lost++;
    console.log(`[Client ${this.id}] 패킷 손실 발생 (총 ${this.stats.packets.lost}개)`);
  }

  recordError(message) {
    this.stats.errors.count++;
    this.stats.errors.messages.push(`${new Date().toISOString()} - ${message}`);
    console.error(`[Client ${this.id}] 오류 발생: ${message}`);
  }

  getStats() {
    const avgLatency =
      this.stats.latency.count > 0 ? this.stats.latency.sum / this.stats.latency.count : 0;

    const packetLossRate =
      this.stats.packets.sent > 0 ? (this.stats.packets.lost / this.stats.packets.sent) * 100 : 0;

    const connectionDuration =
      this.stats.isConnected && this.stats.connectionTime
        ? (Date.now() - this.stats.connectionTime) / 1000
        : this.stats.disconnectionTime && this.stats.connectionTime
          ? (this.stats.disconnectionTime - this.stats.connectionTime) / 1000
          : 0;

    return {
      clientId: this.id,
      roomId: this.roomId,
      latency: {
        avg: Math.round(avgLatency),
        max: this.stats.latency.max,
        min: this.stats.latency.min === Infinity ? 0 : this.stats.latency.min,
      },
      packets: {
        sent: this.stats.packets.sent,
        received: this.stats.packets.received,
        lost: this.stats.packets.lost,
        lossRate: packetLossRate.toFixed(2) + '%',
      },
      errors: {
        count: this.stats.errors.count,
        messages: this.stats.errors.messages,
      },
      connection: {
        duration: connectionDuration.toFixed(2) + 's',
        isConnected: this.stats.isConnected,
        lastPacketTime: this.stats.lastPacketTime
          ? new Date(this.stats.lastPacketTime).toISOString()
          : 'Never',
      },
    };
  }

  createPacket(packetType, payload) {
    try {
      const typeBuffer = Buffer.alloc(2);
      typeBuffer.writeUInt16BE(packetType);

      const version = '1.0.0';
      const versionLengthBuffer = Buffer.alloc(1);
      versionLengthBuffer.writeUInt8(version.length);

      const versionBuffer = Buffer.from(version);

      const sequenceBuffer = Buffer.alloc(4);
      sequenceBuffer.writeUInt32BE(++this.sequence);

      let payloadBuffer;
      const packetFieldMap = {
        [PACKET_TYPE.LOGIN_REQUEST]: 'loginRequest',
        [PACKET_TYPE.CREATE_ROOM_REQUEST]: 'createRoomRequest',
        [PACKET_TYPE.JOIN_ROOM_REQUEST]: 'joinRoomRequest',
        [PACKET_TYPE.GAME_PREPARE_REQUEST]: 'gamePrepareRequest',
        [PACKET_TYPE.GAME_START_REQUEST]: 'gameStartRequest',
      };

      const fieldName = packetFieldMap[packetType];
      if (!fieldName) {
        throw new Error(`알 수 없는 패킷 타입: ${packetType}`);
      }

      const message = this.GamePacket.create({
        [fieldName]: payload,
      });
      payloadBuffer = this.GamePacket.encode(message).finish();

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
    } catch (err) {
      this.recordError(`패킷 생성 오류: ${err.message}`);
      throw err;
    }
  }

  async sendPacketWithResponse(packetType, payload, timeoutMs = RESPONSE_TIMEOUT) {
    return new Promise((resolve, reject) => {
      try {
        const sendTime = Date.now();
        this.recordPacketSent();

        const packet = this.createPacket(packetType, payload);
        this.socket.write(packet);

        const timeout = setTimeout(() => {
          this.recordPacketLost();
          reject(new Error(`응답 타임아웃 (${timeoutMs}ms)`));
        }, timeoutMs);

        const responseHandler = (data) => {
          clearTimeout(timeout);
          const latency = Date.now() - sendTime;
          this.recordPacketReceived(latency);
          resolve(data);
        };

        this.socket.once('data_processed', responseHandler);
      } catch (err) {
        this.recordError(err.message);
        reject(err);
      }
    });
  }

  async startGameFlow() {
    try {
      console.log(`[Client ${this.id}] 게임 플로우 시작`);

      // 로그인
      const loginPayload = {
        email: `test_user_${this.id}@test.com`,
        password: 'testpass',
      };
      console.log(`[Client ${this.id}] 로그인 시도`);
      await this.sendPacketWithResponse(PACKET_TYPE.LOGIN_REQUEST, loginPayload);
      this.isLoggedIn = true;
      console.log(`[Client ${this.id}] 로그인 성공`);

      if (this.isRoomOwner) {
        // 방장: 방 생성 및 게임 시작
        const createRoomPayload = {
          name: `Test Room ${this.roomId}`,
          maxUserNum: PLAYERS_PER_ROOM,
        };
        console.log(`[Client ${this.id}] 방 생성 시도 (${this.roomId}번 방)`);
        await this.sendPacketWithResponse(PACKET_TYPE.CREATE_ROOM_REQUEST, createRoomPayload);
        console.log(`[Client ${this.id}] 방 생성 성공`);

        // 게임 준비 및 시작
        setTimeout(async () => {
          console.log(`[Client ${this.id}] 게임 준비 시도`);
          await this.sendPacketWithResponse(PACKET_TYPE.GAME_PREPARE_REQUEST, {});
          console.log(`[Client ${this.id}] 게임 준비 완료`);

          setTimeout(async () => {
            console.log(`[Client ${this.id}] 게임 시작 시도`);
            await this.sendPacketWithResponse(PACKET_TYPE.GAME_START_REQUEST, {});
            console.log(`[Client ${this.id}] 게임 시작 완료`);
          }, 2000);
        }, 3000);
      } else {
        // 일반 유저: 방 참가
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const joinRoomPayload = {
          roomId: this.roomId,
        };
        console.log(`[Client ${this.id}] 방 참가 시도 (${this.roomId}번 방)`);
        await this.sendPacketWithResponse(PACKET_TYPE.JOIN_ROOM_REQUEST, joinRoomPayload);
        console.log(`[Client ${this.id}] 방 참가 성공`);
      }
    } catch (err) {
      this.recordError(`게임 플로우 오류: ${err.message}`);
      console.error(`[Client ${this.id}] 게임 플로우 실패:`, err);
      this.socket.destroy();
    }
  }

  async connect() {
    try {
      await this.initializeProtobuf();
      console.log(`[Client ${this.id}] 서버 연결 시도`);
      this.socket.connect(PORT, HOST);
    } catch (err) {
      this.recordError(`연결 시도 실패: ${err.message}`);
      console.error(`[Client ${this.id}] 연결 실패:`, err);
    }
  }
}

async function startLoadTest() {
  console.log('\n=== 부하 테스트 시작 ===');
  console.log(`- 총 방 개수: ${ROOMS_COUNT}`);
  console.log(`- 방당 인원: ${PLAYERS_PER_ROOM}`);
  console.log(`- 총 클라이언트: ${TOTAL_CLIENTS}`);
  console.log(`- 테스트 시간: ${TEST_DURATION / 1000}초\n`);

  const clients = [];
  for (let i = 1; i <= TOTAL_CLIENTS; i++) {
    const client = new TestClient(i);
    clients.push(client);
    await new Promise((resolve) => setTimeout(resolve, CONNECTION_DELAY));
    client.connect().catch((err) => {
      console.error(`클라이언트 ${i} 실행 오류:`, err);
    });
  }

  // 테스트 진행 상황 모니터링
  const monitoringInterval = setInterval(() => {
    const connectedClients = clients.filter((client) => client.stats.isConnected).length;
    console.log(`\n현재 연결된 클라이언트: ${connectedClients}/${TOTAL_CLIENTS}`);
  }, 5000);

  // 테스트 종료 후 통계 출력
  setTimeout(() => {
    clearInterval(monitoringInterval);
    console.log('\n=== 부하 테스트 결과 ===\n');

    // 전체 통계 집계
    const totalStats = {
      connectedClients: 0,
      totalLatency: 0,
      maxLatency: 0,
      minLatency: Infinity,
      totalPacketsSent: 0,
      totalPacketsReceived: 0,
      totalPacketsLost: 0,
      totalErrors: 0,
    };

    // 각 클라이언트별 통계 수집
    clients.forEach((client) => {
      const stats = client.getStats();
      if (stats.connection.isConnected) totalStats.connectedClients++;
      totalStats.totalLatency += stats.latency.avg;
      totalStats.maxLatency = Math.max(totalStats.maxLatency, stats.latency.max);
      totalStats.minLatency = Math.min(totalStats.minLatency, stats.latency.min);
      totalStats.totalPacketsSent += stats.packets.sent;
      totalStats.totalPacketsReceived += stats.packets.received;
      totalStats.totalPacketsLost += stats.packets.lost;
      totalStats.totalErrors += stats.errors.count;
    });

    // 전체 통계 출력
    console.log('1. 전체 통계');
    console.log(`- 총 클라이언트: ${TOTAL_CLIENTS}`);
    console.log(`- 연결된 클라이언트: ${totalStats.connectedClients}`);
    console.log(`- 평균 레이턴시: ${Math.round(totalStats.totalLatency / TOTAL_CLIENTS)}ms`);
    console.log(`- 최대 레이턴시: ${totalStats.maxLatency}ms`);
    console.log(
      `- 최소 레이턴시: ${totalStats.minLatency === Infinity ? 0 : totalStats.minLatency}ms`,
    );
    console.log(`- 총 전송 패킷: ${totalStats.totalPacketsSent}`);
    console.log(`- 총 수신 패킷: ${totalStats.totalPacketsReceived}`);
    console.log(
      `- 패킷 손실률: ${((totalStats.totalPacketsLost / totalStats.totalPacketsSent) * 100).toFixed(2)}%`,
    );
    console.log(`- 총 에러 발생: ${totalStats.totalErrors}건\n`);

    // 방별 통계 출력
    console.log('2. 방별 통계');
    for (let roomId = 1; roomId <= ROOMS_COUNT; roomId++) {
      const roomClients = clients.filter((client) => client.roomId === roomId);
      const roomStats = {
        connectedClients: 0,
        avgLatency: 0,
        packetLoss: 0,
        errors: 0,
      };

      roomClients.forEach((client) => {
        const stats = client.getStats();
        if (stats.connection.isConnected) roomStats.connectedClients++;
        roomStats.avgLatency += stats.latency.avg;
        roomStats.packetLoss += parseFloat(stats.packets.lossRate);
        roomStats.errors += stats.errors.count;
      });

      console.log(`\n방 ${roomId}번:`);
      console.log(`- 결된 클라이언트: ${roomStats.connectedClients}/${PLAYERS_PER_ROOM}`);
      console.log(`- 평균 레이턴시: ${Math.round(roomStats.avgLatency / PLAYERS_PER_ROOM)}ms`);
      console.log(`- 평균 패킷 손실률: ${(roomStats.packetLoss / PLAYERS_PER_ROOM).toFixed(2)}%`);
      console.log(`- 총 에러: ${roomStats.errors}건`);
    }

    // 에러 발생 클라이언트 리스트
    const errorClients = clients.filter((client) => client.getStats().errors.count > 0);
    if (errorClients.length > 0) {
      console.log('\n3. 에러 발생 클라이언트');
      errorClients.forEach((client) => {
        const stats = client.getStats();
        console.log(`\n클라이언트 ${client.id} (방 ${client.roomId}):`);
        stats.errors.messages.forEach((msg) => console.log(`- ${msg}`));
      });
    }

    // 테스트 종료 및 연결 해제
    console.log('\n테스트 종료 중...');
    clients.forEach((client) => {
      if (client.socket.connected) {
        client.socket.destroy();
      }
    });
    process.exit(0);
  }, TEST_DURATION);
}

startLoadTest();
