import { createResponse } from '../packet/response/createResponse.js';
import config from '../../config/config.js';

const {
  packet: { packetType: PACKET_TYPE },
  character: { characterStateType: CHARACTER_STATE_TYPE, characterType: CHARACTER_TYPE },
  card: { cardType: CARD_TYPE },
} = config;

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
      // 손패 갯수 업데이트
      user.character.handCardsCount = user.character.handCards.length;

      if (
        user.character.weapon === CARD_TYPE.AUTO_RIFLE || // 라이플 들거나
        user.character.characterType === CHARACTER_TYPE.RED // 레드면 빵 수 제한없음
      ) {
        user.character.maxBbangCount = Number.MAX_SAFE_INTEGER;
      } else if (user.character.weapon === CARD_TYPE.HAND_GUN) {
        // 핸드건이면 2발
        user.character.maxBbangCount = 2;
      } else {
        // 이외에는 1발
        user.character.maxBbangCount = 1;
      }
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
        PACKET_TYPE.USER_UPDATE_NOTIFICATION,
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
