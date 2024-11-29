import config from '../../config/config.js';
import gameEndNotification from '../../utils/notification/gameEndNotification.js';
import phaseUpdateNotification from '../../utils/notification/phaseUpdateNotification.js';
import IntervalManager from '../managers/interval.manager.js';
import CardDeck from './cardDeck.class.js';
import warningNotification from '../../utils/notification/warningNotification.js';
import userUpdateNotification from '../../utils/notification/userUpdateNotification.js';
import { setFleaMarketPickInterval } from '../../utils/util/intervalFunction.js';
import updateNotification from '../../utils/notification/updateNotification.js';
import animationNotification from '../../utils/notification/animationNotification.js';

const {
  packet: { packetType: PACKET_TYPE },
  globalFailCode: { globalFailCode: GLOBAL_FAIL_CODE },
  character: { characterType: CHARACTER_TYPE, characterStateType: CHARACTER_STATE_TYPE },
  role: { roleType: ROLE_TYPE, rolesDistribution: ROLES_DISTRIBUTION },
  roomStateType: { wait: WAIT, prepare: PREPARE, inGame: INGAME },
  interval: INTERVAL,
  intervalType: INTERVAL_TYPE,
  phaseType: PHASE_TYPE,
  winType: WIN_TYPE,
  card: { cardType: CARD_TYPE },
  animationType: ANIMATION_TYPE,
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
    // 인터버 매니저. 동기화중. 플레이어가 죽었으면? 관전을 위해서는 동기화도 이루어지긴해야함.
    // 해야하는 동기화와 아닌동기화 구분할 필요 있을듯.
    this.intervalManager = new IntervalManager();
    this.phase = PHASE_TYPE.DAY;

    // 게임내의 생존한 역할 숫자.
    this.targetCount = 0;
    this.hitmanCount = 0;
    this.psychopathCount = 0;

    this.cardDeck = new CardDeck();
    this.fleaMarket = null;
  }

  remove() {
    this.intervalManager.clearAll();
  }

  // 들어온 순서대로 반영.
  // 유저의 계정 user클래스
  getAllUsers() {
    return this.userOrder.map((id) => this.users[id].user);
  }

  // 게임내에서 생존해있는 유저들 가져오기
  getLiveUsers() {
    return this.userOrder
      .filter((id) => this.users[id].character.hp > 0)
      .map((id) => this.users[id].user);
  }

  // 해당 유저의 다음번 살아있는 유저
  getNextUser(userId) {
    const curUserIndex = this.userOrder.findIndex((id) => id === userId);
    if (curUserIndex === -1) {
      throw new Error('현재 게임에 해당 유저가 없습니다.');
    }
    let nextUserIndex = curUserIndex;

    do {
      nextUserIndex = (nextUserIndex + 1) % this.userOrder.length;
      if (this.users[this.userOrder[nextUserIndex]].character.hp > 0) {
        return this.users[this.userOrder[nextUserIndex]].user;
      }
    } while (nextUserIndex !== curUserIndex);

    throw new Error('살아있는 유저가 없습니다.');
  }

  getPrevUser(userId) {
    const curUserIndex = this.userOrder.findIndex((id) => id === userId);
    if (curUserIndex === -1) {
      throw new Error('현재 게임에 해당 유저가 없습니다.');
    }
    let prevUserIndex = curUserIndex;

    // 순환적으로 이전 유저를 찾는다.
    while (true) {
      prevUserIndex = (prevUserIndex - 1 + this.userOrder.length) % this.userOrder.length;

      // 현재 유저로 다시 돌아오면 중단
      if (prevUserIndex === curUserIndex) {
        throw new Error('살아있는 유저가 없습니다.');
      }

      // 살아있는 유저를 발견하면 반환
      if (this.users[this.userOrder[prevUserIndex]].character.hp > 0) {
        console.log(`이전 유저 : ${this.users[this.userOrder[prevUserIndex]].user.nickname}`);
        return this.users[this.userOrder[prevUserIndex]].user;
      }
    }
  }

  // 유저의 데이터 캐릭터데이터를 포함.
  // 참조가 아닌 깊은 복사.
  getAllUserDatas() {
    const userDatas = this.userOrder.map((id) => ({
      id: this.users[id].user.id,
      nickname: this.users[id].user.nickname,
      character: this.users[id].character,
    }));

    return userDatas;
  }

  getRoomData() {
    return {
      id: this.id,
      ownerId: this.ownerId,
      name: this.name,
      maxUserNum: this.maxUserNum,
      state: this.state,
      users: this.getAllUserDatas(), // 클라이언트에 보낼때 유저의 유저데이터만을 보내야함. id, nickname, characterData
    };
  }

  getUserLength() {
    return this.userOrder.length;
  }

  // 게임 캐릭터의 상태 변경
  changeState(newState) {
    this.state = newState;
  }

  /**
   * 스테이트 변경. 해당하는 인터버 함수 추가.
   * @param {현재유저id} curUserId
   * @param {현재상태} curState
   * @param {현재상태 종료시 상태} nextState
   * @param {현재상태 지속시간 sec} time
   * @param {타겟 id 없으면 0} targetId
   */
  setCharacterState(curUserId, curState, nextState, time, targetId) {
    const character = this.getCharacter(curUserId);

    character.stateInfo.state = curState;
    character.stateInfo.nextState = nextState;
    character.stateInfo.nextStateAt = Date.now() + time * 1000;
    character.stateInfo.stateTargetUserId = targetId;

    if (targetId)
      switch (curState) {
        case CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE:
          this.intervalManager.removeIntervalByType(curUserId, INTERVAL_TYPE.CHARACTER_STATE);
          break;
        case CHARACTER_STATE_TYPE.BBANG_SHOOTER:
          break;
        case CHARACTER_STATE_TYPE.BBANG_TARGET:
          break;
        case CHARACTER_STATE_TYPE.DEATH_MATCH_STATE:
          break;
        case CHARACTER_STATE_TYPE.DEATH_MATCH_TURN_STATE:
          break;
        case CHARACTER_STATE_TYPE.FLEA_MARKET_TURN:
          // 선택안할경우를 대비해 자동으로 카드선택후 다음 유저에게 넘기는 것.
          this.intervalManager.addInterval(
            curUserId,
            () => setFleaMarketPickInterval(this, this.users[curUserId].user),
            time,
            INTERVAL_TYPE.CHARACTER_STATE,
          );
          break;
        case CHARACTER_STATE_TYPE.FLEA_MARKET_WAIT:
          break;
        case CHARACTER_STATE_TYPE.GUERRILLA_SHOOTER:
          break;
        case CHARACTER_STATE_TYPE.GUERRILLA_TARGET:
          break;
        case CHARACTER_STATE_TYPE.BIG_BBANG_SHOOTER:
          break;
        case CHARACTER_STATE_TYPE.BIG_BBANG_TARGET:
          break;
        case CHARACTER_STATE_TYPE.ABSORBING:
          break;
        case CHARACTER_STATE_TYPE.ABSORB_TARGET:
          break;
        case CHARACTER_STATE_TYPE.HALLUCINATING:
          break;
        case CHARACTER_STATE_TYPE.HALLUCINATION_TARGET:
          break;
        case CHARACTER_STATE_TYPE.CONTAINED:
          break;

        default:
          break;
      }

    updateNotification(this, this.users[curUserId].user);
  }

  // 살아있는 애들만 none으로 한번 초기화
  setAllUserNone() {
    const allUsers = this.getLiveUsers();
    allUsers.forEach((curUser) => {
      this.setCharacterState(
        curUser.id,
        CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
        CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
        0,
        0,
      );
    });
    userUpdateNotification(this);
  }

  // 유저 추가
  addUser(user) {
    if (this.getUserLength() >= this.maxUserNum) {
      throw new Error(
        `방이 가득 찼습니다. 현재인원 : ${this.getUserLength()}, 최대 인원 : ${this.maxUserNum}`,
      );
    }
    // 캐릭터 스테이트 인포
    const defaultStateInfo = {
      state: CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
      nextState: CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
      nextStateAt: 0,
      targetId: 0,
    };

    // 캐릭터 데이터
    const defaultCharacter = {
      characterType: CHARACTER_TYPE.NONE_CHARACTER, // 캐릭터 종류
      roleType: ROLE_TYPE.NONE_ROLE, // 역할 종류
      hp: 0,
      weapon: 0,
      stateInfo: {
        ...defaultStateInfo,
      },
      equips: [],
      debuffs: [],
      handCards: [],
      bbangCount: 0,
      handCardsCount: 0,
      autoShield: false,
    };

    this.users[user.id] = {
      user, // 유저
      character: { ...defaultCharacter },
      prevStateInfo: {
        ...defaultStateInfo,
      },
      isDeath: false, // 본인이 죽었는지를 몰라서 추가했던 변수, 반영되는거 없음.
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

    // 룸 상태 prepare로 변경
    this.state = PREPARE;

    // 역할 배분에 순서가 중요하진 않음.
    Object.values(this.users).forEach((userEntry, index) => {
      const characterType = preparedCharacter[index];
      const roleType = preparedRole[index];

      userEntry.character.characterType = characterType;
      userEntry.character.roleType = roleType;

      // 체력정보도 나중에 상수화 시키면 좋을듯.
      if (
        characterType === CHARACTER_TYPE.DINOSAUR ||
        characterType === CHARACTER_TYPE.PINK_SLIME
      ) {
        userEntry.character.hp = 5;
      } else {
        userEntry.character.hp = 5;
      }

      if (roleType === ROLE_TYPE.TARGET) {
        //userEntry.character.hp++;
        this.targetCount++;
      } else if (roleType === ROLE_TYPE.HITMAN) {
        this.hitmanCount++;
      } else if (roleType === ROLE_TYPE.PSYCHOPATH) {
        this.psychopathCount++;
      }
      userEntry.character.weapon = 13; // 총 장착하는 곳. 총 카드 번호가 아니라면 불가능하게 검증단계 필요.
      userEntry.character.stateInfo = {
        state: CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
        nextState: CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
        nextStateAt: 0,
        stateTargetUserId: 0,
      }; // 캐릭터 스테이트 타입
      userEntry.character.equips = [];
      userEntry.character.debuffs = [];
      userEntry.character.handCards = [
        { type: CARD_TYPE.FLEA_MARKET, count: 1 },
        { type: CARD_TYPE.BOMB, count: 1 },
        { type: CARD_TYPE.BBANG, count: 5 },
        { type: CARD_TYPE.AUTO_SHIELD, count: 1 },
        { type: CARD_TYPE.SHIELD, count: 1 },
      ];
      const drawCard = this.cardDeck.drawMultipleCards(userEntry.character.hp + 2);
      userEntry.character.handCards.push(
        ...drawCard,
        { type: 1, count: 2 },
        { type: 3, count: 1 },
        { type: 21, count: 1 },
        { type: 22, count: 1 },
      );
      userEntry.character.bbangCount = 0; // 빵을 사용한 횟수.
      userEntry.character.handCardsCount = userEntry.character.handCards.length;
      userEntry.character.autoShield = false;
      userEntry.character.isContain = false;
    });
  }

  // 유저 제거
  removeUser(userId) {
    if (!this.users[userId]) {
      return;
    }
    this.intervalManager.removeInterval(userId);
    delete this.users[userId];
    this.userOrder = this.userOrder.filter((id) => id !== userId); // 순서에서도 제거
    // 인터버 매니져 추가되면.
    //this.intervalManager.removePlayer(userId);
  }

  // userId로 user찾기
  getUser(userId) {
    const user = this.users[userId].user;
    console.log('getUser: ', user);
    return user;
  }

  getCharacter(userId) {
    const Character = this.users[userId].character;
    return Character;
  }

  //!  ===  카드 사용 효과 ===
  minusBbangCount(userId) {
    return --this.getCharacter(userId).bbangCount;
  }

  plusBbangCount(userId) {
    return ++this.getCharacter(userId).bbangCount;
  }

  minusHp(userId) {
    return --this.getCharacter(userId).hp;
  }

  plusHp(userId) {
    return ++this.getCharacter(userId).hp;
  }

  minusHandCardsCount(userId) {
    return --this.getCharacter(userId).handCardsCount;
  }

  MaturedSavings(userId) {
    const giveCard = this.cardDeck.drawMultipleCards(2);
    const handCard = this.getCharacter(userId).handCards;
    const newHandCard = [...handCard, ...giveCard];
    // console.log('새로운카드'+giveCard)
    // console.log('보유중이던 카드'+handCard)
    // console.log('새롭게 추가된 카드'+newHandCard)
    return (this.getCharacter(userId).handCards = newHandCard);
  }

  winLottery(userId) {
    const giveCard = this.cardDeck.drawMultipleCards(3);
    const handCard = this.getCharacter(userId).handCards;
    const newHandCard = [...handCard, ...giveCard];
    return (this.getCharacter(userId).handCards = newHandCard);
  }

  // 카드가 유저의 핸드에서 제거될때.
  removeCard(userId, cardType) {
    const handCards = this.getCharacter(userId).handCards;
    const index = handCards.findIndex((card) => card.type === cardType);
    this.cardDeck.addUseCard(cardType);
    if (index !== -1) {
      handCards[index].count > 1 ? (handCards[index].count -= 1) : handCards.splice(index, 1);
    }
    this.getCharacter(userId).handCardsCount = handCards.length;
  }

  BbangShooterStateInfo(userId, targeId) {
    this.getCharacter(userId).stateInfo.state = CHARACTER_STATE_TYPE.BBANG_SHOOTER;
    this.getCharacter(userId).stateInfo.nextState = CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE;
    this.getCharacter(userId).stateInfo.nextStateAt = Date.now() + 3000;
    this.getCharacter(userId).stateInfo.stateTargetUserId = targeId;
  }

  BbangTargetStateInfo(targeId) {
    this.getCharacter(targeId).stateInfo.state = CHARACTER_STATE_TYPE.BBANG_TARGET;
    this.getCharacter(targeId).stateInfo.nextState = CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE;
    this.getCharacter(targeId).stateInfo.nextStateAt = Date.now() + 3000;
    this.getCharacter(targeId).stateInfo.stateTargetUserId = targeId;
  }

  // ShieudUserStateInfo(userId) {
  //   this.getCharacter(userId).stateInfo = CHARACTER_STATE_TYPE.;
  // }

  // ! 무기 카드 추가/변경
  addWeapon(userId, cardType) {
    if (this.getCharacter(userId).weapon !== 0) {
      this.cardDeck.addUseCard(this.getCharacter(userId).weapon);
    }
    this.getCharacter(userId).weapon = cardType;
  }

  // ! 장비 추가
  addEquip(userId, cardType) {
    this.getCharacter(userId).equips.push(cardType);
  }

  //^ 디버프
  addbuffs(targeId, cardType) {
    this.getCharacter(targeId).debuffs.push(cardType);
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

  setCharacterDataByUserId(userId, character) {
    if (!this.users[userId]) {
      throw new Error(`${userId}를 가지는 유저가 없습니다.`);
    }

    this.users[userId].character = character;
  }

  // 게임 내 모든 유저 위치 배열로.
  getAllUserPos() {
    const userPosDatas = this.userOrder.map((id) => this.users[id].user.getPos());
    return userPosDatas;
  }

  setAllUserPos(posDatas) {
    this.getAllUsers().forEach((user, i) => {
      user.setPos(posDatas[i].x, posDatas[i].y);
    });
  }

  findRandomSurvivingUser(currentUserId) {
    const survivingUsers = Object.values(this.users).filter(({ user }) => {
      // 현재 자신은 목록에서 제외
      return user.id !== currentUserId;
    });

    if (survivingUsers.length === 0) {
      return null;
    }

    // 다음 디버프를 받은 유저는 랜덤으로 결정
    const randomIndex = Math.floor(Math.random() * survivingUsers.length);
    return survivingUsers[randomIndex].user.id;
  }

  nextPhase() {
    if (this.phase === PHASE_TYPE.END) {
      this.phase = PHASE_TYPE.DAY;
    } else if (this.phase === PHASE_TYPE.DAY) {
      this.phase = PHASE_TYPE.END;
    }
  }

  //   유저배열, 승리직업배열
  getWinnerUser(targetRoles) {
    const winners = this.getAllUserDatas()
      .filter((user) => targetRoles.includes(user.character.role))
      .map((user) => user.id);
    return winners;
  }

  winnerUpdate(notiData) {
    let winRoles = [];
    if (this.targetCount === 0 && this.hitmanCount === 0) {
      notiData.winType = WIN_TYPE.PSYCHOPATH_WIN;
      winRoles = [ROLE_TYPE.PSYCHOPATH];
      notiData.winners = this.getWinnerUser(winRoles);
    } else if (this.targetCount === 0) {
      notiData.winType = WIN_TYPE.HITMAN_WIN;
      winRoles = [ROLE_TYPE.HITMAN];
      notiData.winners = this.getWinnerUser(winRoles);
    } else if (this.hitmanCount === 0 && this.psychopathCount === 0) {
      notiData.winType = WIN_TYPE.TARGET_AND_BODYGUARD_WIN;
      winRoles = [ROLE_TYPE.TARGET, ROLE_TYPE.BODYGUARD];
      notiData.winners = this.getWinnerUser(winRoles);
    } else {
      return;
    }
  }

  // 게임싱크에 관해.
  // 주기적으로 플레이어들의 체력상태를 확인하여 어느 역할군이 몇명살아있나 확인해야 게임END 노티를 보낼수 있음.
  // 유저 업데이트 노티도 여기서 할듯
  gameUpdate() {
    // 체력이 0이되면 죽도록 없데이트.
    const userDatas = this.getAllUserDatas();
    let targetCount = 0;
    let hitmanCount = 0;
    let psychopathCount = 0;

    userDatas.forEach((user) => {
      if (user.character.hp === 0) {
        return;
      }

      // 만약 내가 감금디버프를 가지고있으면서, is감금이 true이면 감금상태로 변환.
      if (
        user.character.debuffs.includes(CARD_TYPE.CONTAINMENT_UNIT) &&
        user.character.isContain === true
      ) {
        this.setCharacterState(
          user.id,
          CHARACTER_STATE_TYPE.CONTAINED,
          CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
          INTERVAL.PHASE_UPDATE_DAY,
          0,
        );
      } else if (
        !user.character.debuffs.includes(CARD_TYPE.CONTAINMENT_UNIT) &&
        user.character.isContain === true
      ) {
        user.character.isContain = false;
      }

      // 이거를 주기적으로 검사.

      const roleType = user.character.roleType;

      if (roleType === ROLE_TYPE.TARGET) {
        targetCount++;
      } else if (roleType === ROLE_TYPE.HITMAN) {
        hitmanCount++;
      } else if (roleType === ROLE_TYPE.PSYCHOPATH) {
        psychopathCount++;
      }
    });

    this.targetCount = targetCount;
    this.hitmanCount = hitmanCount;
    this.psychopathCount = psychopathCount;

    const gameEndNotiData = {
      winners: null,
      winType: 0,
    };

    this.winnerUpdate(gameEndNotiData);
    if (gameEndNotiData.winners !== null) {
      gameEndNotification(this.getAllUsers(), this.id, gameEndNotiData);
      return;
    }
    userUpdateNotification(this);
  }

  // debuff가 있는지 체크
  debuffCheck(userCharacter, debuff) {
    return userCharacter.debuffs.includes(debuff);
  }

  // 디버프 들고 있는 유저를 찾는 방식.
  getDebuffUser(debuff) {
    const users = this.getAllUserDatas();
    let debuffUser = 0;
    users.forEach((user) => {
      const character = this.getCharacter(user.id);
      if (this.debuffCheck(character, debuff)) {
        console.dir(user, null);
        debuffUser = user;
      }
    });
    return debuffUser;
  }

  // 위성타겟 디버프 가졌는지 확인하고 다음유저에게 넘기기까지
  debuffUpdate() {
    // 위성 타겟 디버프 처리
    const satelliteTargetUser = this.getDebuffUser(CARD_TYPE.SATELLITE_TARGET);
    if (satelliteTargetUser) {
      const satelliteCharacter = this.getCharacter(satelliteTargetUser.id);

      const satelIndex = satelliteCharacter.debuffs.indexOf(CARD_TYPE.SATELLITE_TARGET);
      if (satelIndex !== -1) {
        satelliteCharacter.debuffs.splice(satelIndex, 1);
      }

      if (Math.random() < 0.03) {
        console.log(`위성 터졌다!`);

        // 효과가 발동되었을 때
        satelliteCharacter.hp -= 3;
        animationNotification(this, ANIMATION_TYPE.SATELLITE_TARGET_ANIMATION, satelliteTargetUser);
      } else {
        const nextUser = this.getNextUser(satelliteTargetUser.id);
        const nextUserCharacter = this.getCharacter(nextUser.id);
        nextUserCharacter.debuffs.push(CARD_TYPE.SATELLITE_TARGET);
      }
    }

    // 감옥 디버프 처리
    const containmentUnitUser = this.getDebuffUser(CARD_TYPE.CONTAINMENT_UNIT);
    if (containmentUnitUser) {
      const containmentCharacter = this.getCharacter(containmentUnitUser.id);

      if (Math.random() < 1) {
        this.users[containmentUnitUser.id].character.isContain = true;
      } else {
        const containmentIndex = containmentCharacter.debuffs.indexOf(CARD_TYPE.CONTAINMENT_UNIT);
        if (containmentIndex !== -1) {
          containmentCharacter.debuffs.splice(containmentIndex, 1);
        }
        this.users[containmentUnitUser.id].character.isContain = false;
      }
    }
  }

  ///////////////////// intervalManager 관련.

  setPhaseUpdateInterval(time) {
    this.intervalManager.addGameInterval(
      this.id,
      () => phaseUpdateNotification(this),
      time,
      INTERVAL_TYPE.PHASE_UPDATE,
    );
  }

  setGameUpdateInterval() {
    this.intervalManager.addGameInterval(
      this.id,
      () => this.gameUpdate(),
      INTERVAL.SYNC_GAME,
      INTERVAL_TYPE.GAME_UPDATE,
    );
  }

  setBoomUpdateInterval(targetUser) {
    console.log('폭탄 인터벌!!!');
    this.intervalManager.addGameInterval(
      this.id,
      () => warningNotification(this, targetUser),
      INTERVAL.BOMB, // 5초 뒤..
      INTERVAL_TYPE.BOMB,
    );
  }
}

export default Game;
///// 필요하면 살림.
// 해당 아이디 유저에게 주기 셋팅
//              유저아이디, 주기, 주기타입, 실행할 함수, 함수의 매개변수들
// setUserSyncInterval(user) {
//   this.intervalManager.addPlayer(
//     user.id,
//     () => this.userSync(user),
//     INTERVAL.SYNC_POSITION,
//     INTERVAL_TYPE.POSITION,
//   );
// }

// // 포지션 노티 여기서 쏴주면 됩니다.
// // 적용하면 상대 캐릭터가 끊기듯이 움직임.
// userSync(user) {
//   const characterPositions = [];
//   const allUser = this.getAllUsers();

//   allUser.forEach((user) => {
//     const posData = {
//       id: user.id,
//       x: user.x,
//       y: user.y,
//     };
//     characterPositions.push(posData);
//   });

//   console.log('Notification Response Data:', { characterPositions });

//   const notiData = {
//     characterPositions: characterPositions,
//   };

//   // 노티피케이션 생성 및 전송
//   const notificationResponse = createResponse(
//     PACKET_TYPE.POSITION_UPDATE_NOTIFICATION,
//     user.socket.sequence,
//     notiData,
//   );

//   allUser.forEach((notiUser) => {
//     notiUser.socket.write(notificationResponse);
//   });
// }
