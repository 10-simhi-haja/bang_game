'use strict';

const protobuf = require('protobufjs');
const path = require('path');
const fs = require('fs');

class ProtocolHandler {
  static async initialize() {
    // 현재 디렉토리에서 .proto 파일 찾기
    const currentDir = __dirname;
    const files = fs.readdirSync(currentDir);
    const protoFile = files.find((file) => file.endsWith('.proto'));

    if (!protoFile) {
      throw new Error('No .proto file found in current directory');
    }

    // Load the proto file
    const root = await protobuf.load(path.join(currentDir, protoFile));
    this.GamePacket = root.lookupType('GamePacket');
  }

  static createPacket(payloadType, payload) {
    // Protobuf 메시지 생성 및 인코딩
    const message = this.GamePacket.create(payload);
    const payloadBuffer = this.GamePacket.encode(message).finish();

    // 클라이언트 버전 정보
    const version = '1.0.0';
    const versionBuffer = Buffer.from(version);
    const versionLength = versionBuffer.length;

    // 시퀀스 번호 생성 (4바이트)
    const sequence = Math.floor(Math.random() * 0xffffffff);

    // 전체 패킷 크기 계산
    const headerSize = 2 + 1 + versionLength + 4 + 4; // type + versionLength + version + sequence + payloadLength
    const totalSize = headerSize + payloadBuffer.length;

    // 버퍼 생성
    const buffer = Buffer.alloc(totalSize);
    let offset = 0;

    // 1. PayloadOneofCase (2바이트, 빅 엔디안)
    buffer.writeUInt16BE(payloadType, offset);
    console.log('PayloadType:', payloadType, 'at offset:', offset);
    offset += 2;

    // 2. 버전 문자열 길이 (1바이트)
    buffer.writeUInt8(versionLength, offset);
    console.log('VersionLength:', versionLength, 'at offset:', offset);
    offset += 1;

    // 3. 버전 문자열
    versionBuffer.copy(buffer, offset);
    console.log('Version:', version, 'at offset:', offset);
    offset += versionLength;

    // 4. 시퀀스 번호 (4바이트, 빅 엔디안)
    buffer.writeUInt32BE(sequence, offset);
    console.log('Sequence:', sequence, 'at offset:', offset);
    offset += 4;

    // 5. 페이로드 길이 (4바이트, 빅 엔디안)
    buffer.writeUInt32BE(payloadBuffer.length, offset);
    console.log('PayloadLength:', payloadBuffer.length, 'at offset:', offset);
    offset += 4;

    // 6. 페이로드 데이터
    payloadBuffer.copy(buffer, offset);
    console.log('PayloadOffset:', offset);

    // 디버깅을 위한 전체 패킷 출력
    console.log('Full packet (hex):', buffer.toString('hex'));
    console.log('Total packet size:', buffer.length);

    // 헤더 부분만 출력
    console.log('Header only (hex):', buffer.subarray(0, headerSize).toString('hex'));

    return buffer;
  }
}

// Initialize protobuf
ProtocolHandler.initialize().catch(console.error);

module.exports = ProtocolHandler;
