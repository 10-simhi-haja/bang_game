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
    this.users = {};
    this.userOrder = [];
    // 인터버 매니저 추가되면.
    // this.intervalManager = new IntervalManager();
  }

  // 들어온 순서대로 반영.
  getAllUsers() {
    return this.userOrder.map((id) => this.users[id].user);
  }

  getRoomData() {
    return {
      id: this.id,
      ownerId: this.ownerId,
      name: this.name,
      maxUserNum: this.maxUserNum,
      state: this.state,
      users: this.userOrder.map((id) => ({
        id: this.users[id].user.id,
        nickname: this.users[id].user.nickname,
        characterData: { ...this.users[id].characterData },
      })), // 클라이언트에 보낼때 유저의 유저데이터만을 보내야함. id, nickname, characterData
    };
  }

  getUserLength() {
    return this.userOrder.length;
  }

  // 게임 상태 변경
  changeState(newState) {
    this.state = newState;
  }

  // 유저 추가
  addUser(user) {
    if (this.getUserLength() >= this.maxUserNum) {
      throw new Error(
        `방이 가득 찼습니다. 현재인원 : ${this.getUserLength()}, 최대 인원 : ${this.maxUserNum}`,
      );
    }

    // 캐릭터 데이터
    const defaultCharacterData = {
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
    };

    this.users[user.id] = {
      user, // 유저
      characterData: { ...defaultCharacterData },
    };
    this.userOrder.push(user.id);
  }

  // 캐릭터, 역할 분배 설정
  setPrepare(preparedCharacter, preparedRole) {
    if (
      this.getUserLength() !== preparedCharacter.length ||
      this.getUserLength() !== preparedRole.length
    ) {
      throw new Error('캐릭터 및 역할 배열의 길이가 유저 수와 일치하지 않습니다.');
    }
    this.state = 1;
    Object.values(this.users).forEach((userEntry, index) => {
      const characterType = preparedCharacter[index];
      const roleType = preparedRole[index];

      userEntry.characterData.characterType = characterType;
      userEntry.characterData.roleType = roleType;

      if (
        characterType === CHARACTER_TYPE.DINOSAUR ||
        characterType === CHARACTER_TYPE.PINK_SLIME
      ) {
        userEntry.characterData.hp = 3;
      } else {
        userEntry.characterData.hp = 4;
      }

      if (roleType === ROLE_TYPE.TARGET) {
        userEntry.characterData.hp++;
      }

      userEntry.characterData.weapon = 0;
      userEntry.characterData.stateInfo = CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE; // 캐릭터 스테이트 타입
      userEntry.characterData.equips = 0;
      userEntry.characterData.debuffs = 0;
      userEntry.characterData.handCards = 0;
      userEntry.characterData.bbangCount = 0;
      userEntry.characterData.handCardsCount = 0;
      console.log(`캐릭터 데이터 : ${userEntry.characterData.characterType}`);
    });
  }

  // 유저 제거
  removeUser(userId) {
    if (!this.users[userId]) {
      return;
    }

    delete this.users[userId];
    this.userOrder = this.userOrder.filter((id) => id !== userId); // 순서에서도 제거
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
      console.log('겟 오퍼넌트 빈유저 반환');
      return null; // 유저가 없으면 빈 배열 반환
    }

    console.log(
      `겟 오퍼넌트 실행 : ${Object.keys(this.users)
        .filter((key) => key !== userId)
        .map((key) => this.users[key])}`,
    );
    return Object.keys(this.users) // 모든 유저 ID 가져오기
      .filter((key) => key !== userId) // userId와 다른 유저 필터링
      .map((key) => this.users[key]); // 상대방 유저 데이터 배열로 반환
  }

  getAllUsers() {
    return Object.values(this.users).map((entry) => entry.user);
  }

  setCharacterDataByUserId(userId, characterData) {
    if (!this.users[userId]) {
      throw new Error(`${userId}를 가지는 유저가 없습니다.`);
    }

    this.users[userId].characterData = characterData;
  }

  /////////////////// notification

  prepareNotification() {
    const roomData = this.getRoomData();

    Object.values(this.users).forEach((user) => {
      user.socket.write(roomData);
    });
  }
}

export default Game;
