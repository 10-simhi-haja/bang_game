import { getGameSessionBySocket } from '../../sessions/game.session.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';
import { GlobalFailCode, PACKET_TYPE } from '../../constants/header.js';

const packetType = PACKET_TYPE;

// 플리마켓 핸들러
const handleFleaMarketPick = async (socket, payload) => {
  try {
    const { pickIndex } = payload;
    const gameSession = getGameSessionBySocket(socket);
    if (!gameSession) {
      throw new Error('해당 유저의 게임 세션이 존재하지 않습니다.');
    }

    const currentUser = gameSession.users.find((user) => user.socket === socket);
    if (!currentUser) {
      throw new Error('유저가 존재하지 않습니다.');
    }

    // 유효한 픽 인덱스인지 검증
    const isValidPickIndex = (index) => {
      // 플리마켓에서 유효한 인덱스인지 확인하는 로직을 구현
      // 일단 다른거부터
      return true;
    };

    if (!isValidPickIndex(pickIndex)) {
      throw new Error('유효하지 않은 픽 인덱스입니다.');
    }

    const success = true;

    if (success) {
      const pickResponseData = {
        success: true,
        failCode: GlobalFailCode.NONE_FAILCODE,
      };

      // 현재 유저에게 응답 전송
      const pickResponse = await createResponse(
        packetType.FLEA_MARKET_PICK_RESPONSE,
        socket.sequence,
        pickResponseData,
      );
      socket.write(pickResponse);
    } else {
      throw new Error('플리마켓 픽 처리에 실패하였습니다.');
    }
  } catch (error) {
    console.error('플리마켓 픽 중 에러 발생:', error.message);

    const errorResponse = await createResponse(packetType.FLEA_MARKET_PICK_RESPONSE, null, {
      success: false,
      message: 'Error processing flea market pick',
      failCode: GlobalFailCode.UNKNOWN_ERROR,
    });
    socket.write(errorResponse);
  }
};

export default handleFleaMarketPick;
