// 핸들러 구현을 위해 임시로 작성한 로직, 돌아가는지 확인이 불가능 하기에 팀원들 코드로 대체 예정
class User {
  // 다수의 유저 데이터를 담아야하기 때문에 배열로 저장
  constructor(socket, userId, nickname) {
    this.socket = socket;
    this.id = userId;
    this.nickname = nickname;
    this.sequence = 0;
    this.x = 0;
    this.y = 0;
  }

  getNextSequence() {
    return ++this.sequence;
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
