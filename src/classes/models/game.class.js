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
      characterData: {
        characterType: 0,
        roleType: 0,
        hp: 0,
        weapon: 0,
        stateInfo: 0, // 캐릭터 스테이트
        equips: 0,
        debuffs: 0,
        handCards: 0,
        bbangCount: 0,
        handCardsCount: 0,
      },
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

  // userId로 user찾기
  getUser(userId) {
    return this.users[userId].user;
  }

  // 자신을 제외한 유저들 배열
  getOpponents(userId) {
    if (!this.users[userId]) {
      return null; // 해당 유저가 없으면 null 반환
    }

    const opponents = Object.keys(this.users) // 모든 유저 ID 가져오기
      .filter((key) => key !== userId) // userId와 다른 유저 필터링
      .map((key) => this.users[key]); // 상대방 유저 데이터 가져오기

    return opponents.length > 0 ? opponents : null; // 상대방이 없으면 null 반환
  }
}

export default Game;
