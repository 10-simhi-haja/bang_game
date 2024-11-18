// 핸들러 구현을 위해 임시로 작성한 로직, 돌아가는지 확인이 불가능 하기에 함수를 제외한 팀원들 코드로 대체 예정
import User from './user.class.js';

class Game {
  constructor(users = []) {
    this.user = new User(users);
  }

  // 게임 내 캐릭터의 위치 업데이트
  updateCharacterPosition(userId, x, y) {
    const user = this.user.getUserById(userId);
    if (user) {
      user.position = { x, y };
      return true;
    }
    return false;
  }
}

export default Game;
