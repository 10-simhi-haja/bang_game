// 핸들러 구현을 위해 임시로 작성한 로직, 돌아가는지 확인이 불가능 하기에 함수를 제외한 팀원들 코드로 대체 예정
import User from './user.class.js';

class Game {
  constructor(roomData) {
    this.id = roomData.id;
    this.ownerId = roomData.ownerId;
    this.name = roomData.name;
    this.maxUserNum = roomData.maxUserNum;
    this.state = roomData.state; // WAIT, PREPARE, INGAME
    this.users = roomData.users.map((userData) => new User(userData));
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
  addUser(userData) {
    if (this.users.length >= this.maxUserNum) {
      throw new Error('Room is full. Cannot add more users.');
    }
    this.users.push(new User(userData));
  }
}

export default Game;
