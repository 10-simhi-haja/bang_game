import { createResponse } from '../packet/response/createResponse.js';
import config from '../../config/config.js';
import { CHARACTER_STATE_TYPE } from '../../constants/header.js';

const packetType = config.packet.packetType;

// 주기적으로 업데이트 노티를 모두에게 보내면서.
// 스테이트가 변경되면 즉시 해당 유저에게만 노티를. 전체에게 말고.

// 카드사용 등으로 상태가 변하는것은 본인과 타겟만 노티를 받으면 됨. => 그럼 다른 상태중이라는걸 다른 사람들은 모르는것 아닌가? => 이제 전체유저 노티에서는 none이 아닌사람들은 건너뛰고 노티를 보내주면?
//
// 전체 유저 업데이트 노티피케이션 함수
const userUpdateNotification = (game) => {
  try {
    if (!game) {
      throw new Error('해당 유저의 게임 세션이 존재하지 않습니다.');
    }

    // 유저 데이터 변환
    const userData = game.getAllUserDatas();

    // 유저 업데이트 부분.
    userData.forEach((user) => {
      user.character.handCardsCount = user.character.handCards.length;
    });

    const notiData = {
      user: userData,
    };

    const allUser = game.getAllUsers();

    allUser.forEach((notiUser) => {
      if (
        game.users[notiUser.id].character.stateInfo.state !==
        CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE
      ) {
        return;
      }
      const notificationResponse = createResponse(
        packetType.USER_UPDATE_NOTIFICATION,
        notiUser.socket.sequence,
        notiData,
      );
      notiUser.socket.write(notificationResponse);
    });
  } catch (error) {
    new Error(error);
  }
};

export default userUpdateNotification;
