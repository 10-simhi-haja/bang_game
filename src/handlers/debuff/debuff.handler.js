import { getGameSessionByUser } from '../../sessions/game.session.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';
import { PACKET_TYPE } from '../../constants/header.js';
import { getUserBySocket } from '../../sessions/user.session.js';
import config from '../../config/config.js';
import userUpdateNotification from '../../utils/notification/userUpdateNotification.js';
import CustomError from '../../utils/errors/customError.js';
import ErrorCodes from '../../utils/errors/errorCodes.js';
import handleError from '../../utils/errors/errorHandler.js';

const packetType = PACKET_TYPE;

// 디버프 전달 요청 핸들러
const handlePassDebuffRequest = async ({ socket, payload }) => {
  try {
    const user = getUserBySocket(socket);
    const room = getGameSessionByUser(user);
    const { targetUserId, debuffCardType } = payload;
    const debuffs = room.users[user.id].character.debuffs.find(
      (debuff) => debuff === debuffCardType,
    );
    const debuffCardIndex = room.users[user.id].character.debuffs.indexOf(debuffs);
    console.log('debuffCardIndex: ', debuffCardIndex);
    if (debuffCardIndex === undefined || debuffCardIndex < 0) {
      throw new CustomError(
        ErrorCodes.NOT_FOUND_CARD,
        '유저의 핸드에 해당 디버프 카드가 존재하지 않는다.',
        socket.sequence,
      );
    }

    // 유저에게 있던 디버프 제거
    room.users[user.id].character.debuffs.splice(debuffCardIndex, 1);
    // 타겟이 된 유저에게 디버프 전달
    room.users[targetUserId].character.debuffs.push(debuffs);

    const responseData = {
      success: true,
      failCode: 0,
    };

    const passDebuff = createResponse(
      config.packet.packetType.PASS_DEBUFF_RESPONSE,
      socket.sequence,
      responseData,
    );

    socket.write(passDebuff);
    userUpdateNotification(room);
  } catch (error) {
    console.error('디버프 전달 중 에러 발생:', error.message);

    // 요청을 보낸 소켓에 실패 여부 보내기
    const errorResponse = createResponse(packetType.PASS_DEBUFF_RESPONSE, socket.sequence, {
      success: false,
      failCode: 1,
      message: error.message || 'Debuff pass failed',
    });
    socket.write(errorResponse);
    handleError(socket, error);
  }
};

export default handlePassDebuffRequest;
