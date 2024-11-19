// 핸들러 구현을 위해 임시로 작성한 로직, 돌아가는지 확인이 불가능 하기에 함수를 제외한 팀원들 코드로 대체 예정
import User from './user.class.js';

// game.users[userId] 로 해당 유저를 찾을 수 있다.
class Game {
  constructor(roomData) {
    this.id = roomData.id;
    this.ownerId = roomData.ownerId;
    this.name = roomData.name;
    this.maxUserNum = roomData.maxUserNum;
    this.state = roomData.state; // WAIT, PREPARE, INGAME
    this.users = {
      length: 0,
    };
    // 인터버 매니저 추가되면.
    // this.intervalManager = new IntervalManager();
  }

  getRoomData() {
    return {
      id: this.id,
      ownerId: this.ownerId,
      name: this.name,
      maxUserNum: this.maxUserNum,
      state: this.state,
      users: this.users.map((user) => user.getUserData()),
    };
  }

  // 게임 상태 변경
  changeState(newState) {
    this.state = newState;
  }

  // 유저 추가
  addUser(user) {
    if (this.users.length >= this.maxUserNum) {
      throw new Error(
        `방이 가득 찼습니다. 현재인원 : ${this.users.length}, 최대 인원 : ${this.maxUserNum}`,
      );
    }

    this.users.length++;
    this.users[user.id] = {
      user,
    };
  }

  removeUser(userId) {
    if (this.users.length == 0) {
      return;
    }
    delete this.users[userId];
    this.users.length--;

    // 인터버 매니져 추가되면.
    // this.intervalManager.removePlayer(userId);
  }
}

export default Game;
