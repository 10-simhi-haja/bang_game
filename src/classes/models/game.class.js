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
import { bbangInterval } from '../../utils/util/bbangFunction.js';
import { bigBbangInterval } from '../../utils/util/bigBbangFunction.js';
import { guerrillaInterval } from '../../utils/util/guerrillaFunction.js';
import { deathMatchInterval } from '../../utils/util/deathMatchFunction.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';
import {
  delUserRedis,
  setGameStateRedis,
  setUserPositionRedis,
  setUserRedis,
  setUserStateRedis,
} from '../../redis/game.redis.js';

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

    this.cardDeck = new CardDeck(this.id);
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

  // 게임내 생존해있는 유저들 아이디 가져오기
  getLiveUsersId() {
    return this.userOrder
      .filter((id) => this.users[id].character.hp > 0)
      .map((id) => this.users[id].user.id);
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
  // 참조형
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
    setUserStateRedis(this.id, curUserId, curState, nextState, time, targetId);

    switch (curState) {
      case CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE:
        console.log('데이터 지우기');
        this.intervalManager.removeIntervalByType(curUserId, INTERVAL_TYPE.CHARACTER_STATE);
        break;
      case CHARACTER_STATE_TYPE.BBANG_SHOOTER:
        // console.log(`빵 setCharacter실행`);
        // console.log(`userId: ${JSON.stringify(this.users[curUserId].user.id, null, 2)}`);
        this.intervalManager.addInterval(
          curUserId,
          () => bbangInterval(this, this.users[curUserId].user),
          time,
          INTERVAL_TYPE.CHARACTER_STATE,
        );
        break;
      case CHARACTER_STATE_TYPE.BBANG_TARGET:
        break;
      case CHARACTER_STATE_TYPE.DEATH_MATCH_STATE:
        break;
      case CHARACTER_STATE_TYPE.DEATH_MATCH_TURN_STATE:
        this.intervalManager.addInterval(
          curUserId,
          () => deathMatchInterval(this, this.users[curUserId].user),
          time,
          INTERVAL_TYPE.CHARACTER_STATE,
        );
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
        this.intervalManager.addInterval(
          curUserId,
          () => guerrillaInterval(this, this.users[curUserId].user),
          time,
          INTERVAL_TYPE.CHARACTER_STATE,
        );
        break;
      case CHARACTER_STATE_TYPE.BIG_BBANG_SHOOTER:
        break;
      case CHARACTER_STATE_TYPE.BIG_BBANG_TARGET:
        this.intervalManager.addInterval(
          curUserId,
          () => bigBbangInterval(this, this.users[curUserId].user),
          time,
          INTERVAL_TYPE.CHARACTER_STATE,
        );
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
      stateTargetUserId: 0,
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
    };

    this.users[user.id] = {
      user, // 유저
      character: { ...defaultCharacter },
      prevStateInfo: {
        ...defaultStateInfo,
      },
    };

    // const redisUserData = {
    //   id: this.id,
    //   userData: {
    //     id: user.id,
    //     // socketId: `${socket.remoteAddress}:${socket.remotePort}`,
    //     // ...defaultStateInfo,
    //     // socket: user.socket,
    //   },
    // };
    // setUserRedis(redisUserData);

    this.userOrder.push(user.id);
  }

  // 캐릭터, 역할 분배 설정
  async setPrepare(preparedCharacter, preparedRole) {
    if (
      this.getUserLength() !== preparedCharacter.length ||
      this.getUserLength() !== preparedRole.length
    ) {
      throw new Error('캐릭터 및 역할 배열의 길이가 유저 수와 일치하지 않습니다.');
    }
    // 룸 상태 prepare로 변경
    this.state = PREPARE;
    setGameStateRedis(this.id, this.state);

    for (let index = 0; index < Object.values(this.users).length; index++) {
      const userEntry = Object.values(this.users)[index];
      const characterType = preparedCharacter[index];
      const roleType = preparedRole[index];
      userEntry.character.characterType = characterType;
      userEntry.character.roleType = roleType;
      // 체력정보도 나중에 상수화 시키면 좋을듯.
      if (
        characterType === CHARACTER_TYPE.DINOSAUR ||
        characterType === CHARACTER_TYPE.PINK_SLIME
      ) {
        userEntry.character.hp = 3;
      } else {
        userEntry.character.hp = 4;
      }
      if (roleType === ROLE_TYPE.TARGET) {
        userEntry.character.hp++;
        this.targetCount++;
      } else if (roleType === ROLE_TYPE.HITMAN) {
        this.hitmanCount++;
      } else if (roleType === ROLE_TYPE.PSYCHOPATH) {
        this.psychopathCount++;
      }
      userEntry.character.weapon = 0; // 총 장착하는 곳. 총 카드 번호가 아니라면 불가능하게 검증단계 필요.
      userEntry.character.stateInfo = {
        state: CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
        nextState: CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
        nextStateAt: 0,
        stateTargetUserId: 0,
      }; // 캐릭터 스테이트 타입
      userEntry.character.equips = [];
      userEntry.character.debuffs = [];
      userEntry.character.handCards = [];
      console.log(`캐릭터배분`);
      const drawCard = await this.cardDeck.drawMultipleCards(userEntry.character.hp + 2);
      userEntry.character.handCards.push(...drawCard);
      userEntry.character.bbangCount = 0; // 빵을 사용한 횟수.
      userEntry.character.handCardsCount = userEntry.character.handCards.length;
      userEntry.character.isContain = false;
      userEntry.character.maxBbangCount = 1;
      userEntry.character.isDeath = false; // 죽는 순간 판별위해서 사용
    }
  }

  // 유저 제거
  removeUser(userId) {
    if (!this.users[userId]) {
      return;
    }

    const redisUserData = {
      id: this.id,
      userData: {
        id: userId,
      },
    };
    delUserRedis(redisUserData);

    this.intervalManager.removeInterval(userId);
    delete this.users[userId];
    this.userOrder = this.userOrder.filter((id) => id !== userId); // 순서에서도 제거
    // 인터버 매니져 추가되면.
    //this.intervalManager.removePlayer(userId);
  }

  // userId로 user찾기
  getUser(userId) {
    const user = this.users[userId].user;
    return user;
  }

  setUsetSocket(userId, data) {
    this.users[userId].user.socket = data;
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

  // ^ 119 호출
  plusAllUsersHp(userId, users) {
    users.forEach((user) => {
      if (user.id !== userId) this.users[user.id].character.hp += 1;
    });
  }

  // 만기 적금
  async MaturedSavings(userId) {
    const giveCard = await this.cardDeck.drawMultipleCards(2);
    const handCard = this.getCharacter(userId).handCards;
    const newHandCard = [...handCard, ...giveCard];
    return (this.getCharacter(userId).handCards = newHandCard);
  }

  // 복권방

  async winLottery(userId) {
    const giveCard = await this.cardDeck.drawMultipleCards(3);
    const handCard = this.getCharacter(userId).handCards;
    const newHandCard = [...handCard, ...giveCard];
    return (this.getCharacter(userId).handCards = newHandCard);
  }

  // 신기루
  mirage(isAbsorbing, type, targetId, selectCard, targetCards, range) {
    let removeCard;

    switch (type) {
      case 0: // 핸드
        if (!isAbsorbing) {
          // 신기루일 경우, 사라진 카드는 사용된 카드 덱 쪽으로 저장
          this.removeCard(targetId, targetCards[range].type);
        } else {
          // 흡수
          this.getCharacter(targetId).handCards[range].count -= 1;
          // 0장이 되면 아예 제거...
          if (this.getCharacter(targetId).handCards[range].count === 0) {
            removeCard = targetCards.filter((index) => index !== targetCards[range]);
            this.getCharacter(targetId).handCards = removeCard;
          }
        }
        break;
      case 1: //장비
        if (!isAbsorbing) {
          this.removeCard(targetId, selectCard);
        } else {
          removeCard = targetCards.filter((index) => index !== selectCard);
          this.getCharacter(targetId).equips = removeCard;
        }
        break;
      case 2: // 무기
        if (!isAbsorbing) {
          this.removeCard(targetId, this.getCharacter(targetId).weapon);
        }
        this.getCharacter(targetId).weapon = 0;
        break;
      case 3: // 디버프
        if (!isAbsorbing) {
          this.removeCard(targetId, selectCard);
        }
        removeCard = targetCards.filter((index) => index !== selectCard);
        this.getCharacter(targetId).debuffs = removeCard;
        break;
    }
  }

  //^ 대미지 받기  맞는놈    때린놈     피해량
  async damageCharacter(character, attCharacter, damage) {
    for (let i = 0; i < damage; i++) {
      if (character.hp <= 0) {
        return;
      }

      character.hp--;

      // 죽은애가 히트맨이면 죽인사람 3장뽑기
      if (character.hp === 0 && character.roleType === ROLE_TYPE.HITMAN) {
        attCharacter.handCards.push(...(await this.cardDeck.drawMultipleCards(3)));
      }

      if (CHARACTER_TYPE.MALANG === character.characterType) {
        // 말랑이
        const drawCard = await this.cardDeck.drawMultipleCards(1);
        character.handCards.push(...drawCard);
      }

      // 핑크 슬라임 때린사람 카드 뺏기
      if (
        CHARACTER_TYPE.PINK_SLIME === character.characterType &&
        attCharacter.handCardsCount !== 0
      ) {
        const randomIndex = Math.floor(Math.random() * attCharacter.handCardsCount);

        const [removeCard] = attCharacter.handCards.splice(randomIndex, 1);
        character.handCards.push(removeCard);
      }
    }
    userUpdateNotification(this);
  }

  // 카드가 유저의 핸드에서 제거될때.
  removeCard(userId, cardType) {
    const character = this.getCharacter(userId);
    const handCards = character.handCards;
    const index = handCards.findIndex((card) => card.type === cardType);
    const notRemoveCardType = [
      CARD_TYPE.SNIPER_GUN,
      CARD_TYPE.HAND_GUN,
      CARD_TYPE.DESERT_EAGLE,
      CARD_TYPE.AUTO_RIFLE,
      CARD_TYPE.LASER_POINTER,
      CARD_TYPE.RADAR,
      CARD_TYPE.AUTO_SHIELD,
      CARD_TYPE.STEALTH_SUIT,
    ];
    if (index !== -1) {
      if (notRemoveCardType.includes(cardType)) {
        // notRemoveCardType에 포함된 카드라면 카드 제거만 실행
        handCards[index].count > 1 ? (handCards[index].count -= 1) : handCards.splice(index, 1);
        character.handCardsCount = handCards.length;
      } else {
        // 그 외의 카드 타입은 기존 로직 모두 실행
        handCards[index].count > 1 ? (handCards[index].count -= 1) : handCards.splice(index, 1);
        character.handCardsCount = handCards.length;
        this.cardDeck.addUseCard(cardType);
      }
    }
  }

  shooterPushArr(shooterId, targetIds) {
    // targetIds가 배열이 아니면 배열로 변환
    const targets = Array.isArray(targetIds) ? targetIds : [targetIds];

    targets.forEach((targetId) => {
      const shooterArr = this.getCharacter(targetId).shooterArr;
      shooterArr.push(shooterId);
      console.log(`${targetId}에게 빵을 쏜 유저 ${shooterArr}`);
    });
  }

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
  addbuffs(targetId, cardType) {
    this.getCharacter(targetId).debuffs.push(cardType);
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
      setUserPositionRedis(this.id, user.id, posDatas[i].x, posDatas[i].y);
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

    // 매 업데이트가 아닌 대미지 받고 유저 죽을때 판정하도록.
    userDatas.forEach(async (user) => {
      // 사망 캐릭터 발생시 그캐릭터 모든 장비, 총, 디버프, 손 카드를 가면군의 손패로
      // 죽는 딱 그순간만 만들어서 그때 처리.
      if (user.character.hp === 0 && !user.character.isDeath) {
        user.character.isDeath = true;
        const maskIndex = this.getLiveUsers().findIndex(
          (liveUser) => this.users[liveUser.id].character.characterType === CHARACTER_TYPE.MASK,
        );

        if (maskIndex !== -1) {
          const characterMask = this.users[this.getLiveUsers()[maskIndex].id].character;
          characterMask.handCards.push(...user.character.handCards);

          // 무기 넣기
          const weaponCard = {
            type: user.character.weapon,
            count: 1,
          };
          characterMask.handCards.push(weaponCard);

          // 장비 넣기
          user.character.equips.forEach((equip) => {
            const equipCard = {
              type: equip,
              count: 1,
            };
            characterMask.handCards.push(equipCard);
          });

          // 디버프 넣기
          user.character.debuffs.forEach((debuff) => {
            const debuffCard = {
              type: debuff,
              count: 1,
            };
            characterMask.handCards.push(debuffCard);
          });
        } else {
          // 무기 버리기
          this.cardDeck.addUseCard(user.character.weapon);

          // 장비 버리기
          user.character.equips.forEach((equip) => {
            this.cardDeck.addUseCard(equip);
          });

          // 디버프 버리기
          user.character.debuffs.forEach((debuff) => {
            this.cardDeck.addUseCard(debuff);
          });
        }
        user.character.weapon = 0;
        user.character.equip = [];
        user.character.debuffs = [];
      }

      // 죽은 상태에 피 0이면 리턴
      if (user.character.hp === 0 && user.character.isDeath) {
        return;
      }

      // 캐릭터가 핑크군일때 손패가 없으면 한장뽑기.
      if (
        user.character.characterType === CHARACTER_TYPE.PINK &&
        user.character.handCardsCount === 0
      ) {
        // 플리마켓, 만기적금, 복권당첨같은 추가 카드를 얻는카드 사용하는순간0장이어도 뽑음. 일단 보류
        user.character.handCards.push(await this.cardDeck.drawCard());
        user.character.handCardsCount = user.character.handCards.length;
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

      const range = Math.floor(Math.random() * 100) + 1; // 1 ~ 100 사이 난수
      if (range <= config.probability.SATELLITE_TARGET) {
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

      if (Math.random() < 0.5) {
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

  //! 필요하면 살림.
  //! 해당 아이디 유저에게 주기 셋팅
  //!             유저아이디, 주기, 주기타입, 실행할 함수, 함수의 매개변수들
  setUserSyncInterval() {
    this.intervalManager.addGameInterval(
      this.id,
      () => this.userSync(),
      INTERVAL.SYNC_POSITION, // 1초마다 진행
      INTERVAL_TYPE.POSITION,
    );
  }

  //!포지션 노티 여기서 쏴주면 됩니다.
  //!적용하면 상대 캐릭터가 끊기듯이 움직임.
  userSync() {
    const allUser = this.getAllUsers();

    const characterPositions = allUser.map((user) => {
      return {
        id: user.id,
        x: user.x,
        y: user.y,
      };
    });

    const notiData = {
      characterPositions: characterPositions,
    };

    // 노티피케이션 생성 및 전송
    const notificationResponse = createResponse(
      PACKET_TYPE.POSITION_UPDATE_NOTIFICATION,
      null,
      notiData,
    );

    allUser.forEach((notiUser) => {
      notiUser.socket.write(notificationResponse);
    });
  }
}

export default Game;
