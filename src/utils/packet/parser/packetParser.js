import { getProtoMessages } from '../../../init/loadProtos.js';
import CustomError from '../../errors/customError.js';
import ErrorCodes from '../../errors/errorCodes.js';

const packetParser = (payload) => {
  // payload의 경우 요청한 패킷 타입에 따라 구조가 다르기 때문에 프로토버퍼로 읽는다.
  // 1. 프로토 메시지 가져오기
  const protoMessages = getProtoMessages();

  // 2. 게임 공통 패킷 구조로 디코딩 (패킷 타입에 맞는 페이로드로 디코딩) 및 검증
  const packet = protoMessages.packet.GamePacket;
  let payloadData;
  try {
    payloadData = packet.decode(payload);
    console.log('\npayload Data: ', payloadData);
  } catch (error) {
    throw new CustomError(ErrorCodes.PACKET_DECODE_ERROR, '패킷 디코딩 중 오류가 발생했습니다.');
  }

  // 3. 게임 공통 패킷 구조가 oneof 형태이기 때문에 프로토버프의 필드값까지 같이 저장되고 있음.
  // 때문에 설정된 필드의 데이터를 추출하는 함수를 구현
  // 설정된 `oneof` 필드명을 가져옴
  for (const key in payloadData) {
    if (payloadData.hasOwnProperty(key) && typeof payloadData[key] === 'object') {
      return {
        payload: payloadData[key],
      };
    }
  }
};

export default packetParser;
