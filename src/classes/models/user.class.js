import characterData from './characterData.class.js';

class User {
  // 다수의 유저 데이터를 담아야하기 때문에 배열로 저장
  constructor(socket, userId, nickname) {
    this.socket = socket;
    this.id = userId;
    this.nickname = nickname;
    this.character = new characterData();
    this.sequence = 0;
    this.x = 0;
    this.y = 0;
  }

  getNextSequence() {
    return ++this.sequence;
  }

  minusBbangCount() {
    return --this.character.bbangCount;
  }

  plusBbangCount() {
    return ++this.character.bbangCount;
  }

  getPos() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
    };
  }

  setPos(x, y) {
    this.x = x;
    this.y = y;
  }
}

export default User;
