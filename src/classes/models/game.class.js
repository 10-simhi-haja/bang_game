import config from '../../config/config.js';

const {
  packet: { packetType: PACKET_TYPE },
  character: { characterType: CHARACTER_TYPE, characterStateType: CHARACTER_STATE_TYPE },
  role: { roleType: ROLE_TYPE, rolesDistribution: ROLES_DISTRIBUTION },
} = config;

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
        characterType: CHARACTER_TYPE.NONE_CHARACTER, // 캐릭터 종류
        roleType: ROLE_TYPE.NONE_ROLE, // 역할 종류
        hp: 0,
        weapon: 0,
        stateInfo: CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE, // 캐릭터 스테이트 타입
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
