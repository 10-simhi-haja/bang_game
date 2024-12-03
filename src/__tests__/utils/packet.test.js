import { Buffer } from 'buffer';

describe('패킷 파싱 테스트', () => {
  describe('클라이언트 -> 서버 패킷 (C2S)', () => {
    test('패킷 구조 테스트', () => {
      // 테스트용 패킷 데이터 생성
      const payloadType = 1; // 2 bytes
      const version = '1.0.0';
      const versionLength = version.length; // 1 byte
      const sequence = 12345; // 4 bytes
      const payload = Buffer.from('test payload');
      const payloadLength = payload.length; // 4 bytes (리틀 엔디안)

      // 패킷 조립
      const packet = Buffer.alloc(2 + 1 + versionLength + 4 + 4 + payloadLength);

      // PayloadOneofCase (2 bytes)
      packet.writeUInt16LE(payloadType, 0);

      // Version Length (1 byte)
      packet.writeUInt8(versionLength, 2);

      // Version
      packet.write(version, 3);

      // Sequence (4 bytes)
      packet.writeUInt32LE(sequence, 3 + versionLength);

      // Payload Length (4 bytes, 리틀 엔디안)
      packet.writeUInt32LE(payloadLength, 7 + versionLength);

      // Payload
      payload.copy(packet, 11 + versionLength);

      // 패킷 파싱 테스트
      let offset = 0;

      // PayloadOneofCase 확인
      const parsedPayloadType = packet.readUInt16LE(offset);
      offset += 2;
      expect(parsedPayloadType).toBe(payloadType);

      // Version Length 확인
      const parsedVersionLength = packet.readUInt8(offset);
      offset += 1;
      expect(parsedVersionLength).toBe(versionLength);

      // Version 확인
      const parsedVersion = packet.toString('utf8', offset, offset + versionLength);
      offset += versionLength;
      expect(parsedVersion).toBe(version);

      // Sequence 확인
      const parsedSequence = packet.readUInt32LE(offset);
      offset += 4;
      expect(parsedSequence).toBe(sequence);

      // Payload Length 확인 (리틀 엔디안)
      const parsedPayloadLength = packet.readUInt32LE(offset);
      offset += 4;
      expect(parsedPayloadLength).toBe(payloadLength);

      // Payload 확인
      const parsedPayload = packet.slice(offset, offset + parsedPayloadLength);
      expect(parsedPayload.toString()).toBe(payload.toString());
    });

    test('리틀 엔디안 페이로드 길이 테스트', () => {
      const testSize = 7;
      const buffer = Buffer.alloc(4);
      buffer.writeUInt32LE(testSize);

      expect(buffer[0]).toBe(7); // 첫 바이트
      expect(buffer[1]).toBe(0); // 두번째 바이트
      expect(buffer[2]).toBe(0); // 세번째 바이트
      expect(buffer[3]).toBe(0); // 네번째 바이트
    });
  });

  describe('서버 -> 클라이언트 패킷 (S2C)', () => {
    test('빅 엔디안 페이로드 길이 테스트', () => {
      const testSize = 7;
      const buffer = Buffer.alloc(4);
      buffer.writeUInt32BE(testSize);

      expect(buffer[0]).toBe(0); // 첫 바이트
      expect(buffer[1]).toBe(0); // 두번째 바이트
      expect(buffer[2]).toBe(0); // 세번째 바이트
      expect(buffer[3]).toBe(7); // 네번째 바이트
    });
  });
});
