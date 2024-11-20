import config from '../../config/config.js';
import { getGameSessionByUser } from '../../sessions/game.session.js';
import { getUserBySocket } from '../../sessions/user.session.js';
import { createResponse } from '../../utils/packet/response/createResponse.js';
import ErrorCodes from '../../utils/errors/errorCodes.js';

const {
  packet: { packetType: PACKET_TYPE },
  character: { characterType: CHARACTER_TYPE },
  role: { roleType: ROLE_TYPE, rolesDistribution: ROLES_DISTRIBUTION },
} = config;

// 역할 및 캐릭터 셔플 요청이 들어온다 payload 없음
// 그것을 Response로 반환 반환값은 성공여부, globalFailCode를 Response에 담아서 반환.
// 이후 noti로 roomData를 알린다.

// RoomData {
//     int32 id = 1;  방 번호
//     int64 ownerId = 2;  방 주인 Id
//     string name = 3; 방 이름
//     int32 maxUserNum = 4; 방 최대 인원 수제한
//     RoomStateType state = 5; // WAIT 0, PREPARE 1, INAGAME 2
//     repeated UserData users = 6; // 인덱스 기반으로 턴 진행
// }

// UserData {
//     int64 id = 1; 유저 Id
//     string nickname = 2; 닉네임
//     CharacterData character = 3;  어떤캐릭터인지.
// }

// CharacterData {
//     CharacterType characterType = 1;  캐릭터 타입. 어떤캐릭터인지
//     RoleType roleType = 2; 역할 타입.
//     int32 hp = 3; 체력
//     int32 weapon = 4; 무기
//     CharacterStateInfoData stateInfo = 5; 캐릭터 상태
//     repeated int32 equips = 6; 장착한 카드
//     repeated int32 debuffs = 7; 보유한 디버프
//     repeated CardData handCards = 8; 보유한 카드 목록
//     int32 bbangCount = 9; 사용한 빵 횟수
//     int32 handCardsCount = 10; 손패갯수
// }

// CharacterPositionData {
//     int64 id = 1; 유저 아이디
//     double x = 2; 좌표
//     double y = 3; 좌표
// }

// CardData {
//     CardType type = 1; 카드 종류
//     int32 count = 2; 카드 갯수
// }

// message C2SGamePrepareRequest {

// }

// message S2CGamePrepareResponse {
//     bool success = 1;
//     GlobalFailCode failCode = 2;
// }

// message S2CGamePrepareNotification {
//     RoomData room = 1;
// }

export const prepareCharacter = (playersCount) => {
  if (!playersCount) {
    throw new Error('플레이어 수를 지정하지 않았습니다.');
  }
  if (playersCount < 2 || playersCount > 7) {
    throw new Error('플레이어 수는 2명 이상 7명 이하이어야 합니다.');
  }

  const characterArray = Object.values(CHARACTER_TYPE); // 캐릭터 값 배열

  // 캐릭터 섞기
  // index 크기만큼 random수를 뽑고
  // 뽑힌 random수와 index맨끝수를 교환 하고
  // index를 감소시키면서 반복하여 랜덤 배분.
  for (let i = characterArray.length - 1; i > 1; i--) {
    const randomIndex = Math.floor(Math.random() * i) + 1;
    [characterArray[i], characterArray[randomIndex]] = [
      characterArray[randomIndex],
      characterArray[i],
    ];
  }

  // 플레이어에게 랜덤 배정
  const prepareCharacters = characterArray.slice(1, playersCount + 1);
  console.log(prepareCharacters);
  return prepareCharacters;
};

export const prepareRole = (playersCount) => {
  // 유효한 플레이어 수인지 확인
  if (!ROLES_DISTRIBUTION[playersCount]) {
    throw new Error(`플레이어 수 ${playersCount}인에 대한 역할 분배가 정의되지 않았습니다.`);
  }

  const roles = [];
  const currentRoles = ROLES_DISTRIBUTION[playersCount];

  Object.entries(currentRoles).forEach(([role, count]) => {
    for (let i = 0; i < count; i++) {
      // test중에는 이름으로 표시되도록
      //roles.push(role);
      // 넘겨줄땐 enum으로
      roles.push(ROLE_TYPE[role]);
    }
  });

  // 역할 섞기
  for (let i = roles.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [roles[i], roles[randomIndex]] = [roles[randomIndex], roles[i]];
  }

  console.log(roles);
  return roles;
};
const prepare = (num) => {};

// 게임 시작을 누르는것은 방장.
// 요청을 보내고 다른 모든이들에게 알림을 보낸다.
export const gamePrepareRequestHandler = ({ socket, payload }) => {
  try {
    console.log(`역할분배`);
    // 1. 방장의 소켓으로 prepare 요청이 들어온다.
    // 1-1. ownerId로 game세션을 찾을수 있어야함.
    const owner = getUserBySocket(socket);
    console.log(`오너: ${owner.nickname}`);
    const game = getGameSessionByUser(owner);
    console.log(`게임 주인 : ${game.ownerId}`);

    // 방 인원수
    const playerCount = Object.keys(game.users).length;
    console.log(`플레이어 인원 : ${playerCount}`);
    const preparedCharacter = prepareCharacter(playerCount); // 배열
    const preparedRole = prepareRole(playerCount); // 배열

    game.setPrepare(preparedCharacter, preparedRole);

    const roomData = game.getRoomData();
    console.log(`룸데이터 : ${roomData.ownerId}`);

    // 성공 실패 응답 해당유저에게 보내고,
    console.log(`xxxxx`);

    // 노티 해당 게임내 플레이어들에게 전부 보내고.
    const users = game.getAllUsers();
    console.log(`xxxxx`);

    const prepareNotiData = {
      room: roomData,
    };

    //////////////////

    // const test1CharacterData = {
    //   characterType: 1, // 캐릭터 종류
    //   roleType: 1, // 역할 종류
    //   hp: 0,
    //   weapon: 0,
    //   stateInfo: 0, // 캐릭터 스테이트 타입
    //   equips: 0,
    //   debuffs: 0,
    //   handCards: 0,
    //   bbangCount: 0,
    //   handCardsCount: 0,
    // };

    // const test2CharacterData = {
    //   characterType: 3, // 캐릭터 종류
    //   roleType: 3, // 역할 종류
    //   hp: 0,
    //   weapon: 0,
    //   stateInfo: 0, // 캐릭터 스테이트 타입
    //   equips: 0,
    //   debuffs: 0,
    //   handCards: 0,
    //   bbangCount: 0,
    //   handCardsCount: 0,
    // };

    // const test3CharacterData = {
    //   characterType: 5, // 캐릭터 종류
    //   roleType: 3, // 역할 종류
    //   hp: 0,
    //   weapon: 0,
    //   stateInfo: 0, // 캐릭터 스테이트 타입
    //   equips: 0,
    //   debuffs: 0,
    //   handCards: 0,
    //   bbangCount: 0,
    //   handCardsCount: 0,
    // };

    // const test4CharacterData = {
    //   characterType: 7, // 캐릭터 종류
    //   roleType: 4, // 역할 종류
    //   hp: 0,
    //   weapon: 0,
    //   stateInfo: 0, // 캐릭터 스테이트 타입
    //   equips: 0,
    //   debuffs: 0,
    //   handCards: 0,
    //   bbangCount: 0,
    //   handCardsCount: 0,
    // };

    // const testUsers = [
    //   { id: 8, nickname: 4, characterData: test1CharacterData },
    //   { id: 7, nickname: 3, characterData: test2CharacterData },
    //   { id: 6, nickname: 2, characterData: test3CharacterData },
    //   { id: 5, nickname: 1, characterData: test4CharacterData },
    // ];

    // const testRoomData = {
    //   id: 1,
    //   ownerId: 8,
    //   name: roomData.name,
    //   maxUserNum: roomData.maxUserNum,
    //   state: this.state,
    //   users: testUsers,
    // };

    // const testNotiData = {
    //   room: testRoomData,
    // };

    // console.log(`xxxxx`);

    // const testNoti = createResponse(
    //   PACKET_TYPE.GAME_PREPARE_NOTIFICATION,
    //   socket.sequence,
    //   testNotiData,
    // );

    // users.forEach((notiUser) => {
    //   console.log(`테스트`);

    //   notiUser.socket.write(testNoti);
    //   console.log(`테스트2`);
    // });

    /////////////////////////////

    console.log(`캐릭터 타입: ${roomData.users[0].characterData.characterType}`);

    const noti = createResponse(
      PACKET_TYPE.GAME_PREPARE_NOTIFICATION,
      socket.sequence,
      prepareNotiData,
    );

    users.forEach((notiUser) => {
      console.log(`전`);
      notiUser.socket.write(noti);
    });

    const prepareResponseData = {
      success: true,
      failCode: 0,
    };

    // 응답 패킷 생성
    const prepareResponse = createResponse(
      PACKET_TYPE.GAME_PREPARE_RESPONSE,
      socket.sequence,
      prepareResponseData,
    );
    console.log(`응답 보냄`);

    socket.write(prepareResponse);

    console.log(`응답 완료`);

    // 크리에이트 리스폰스(성공여부, 실패코드)
  } catch (error) {}
};
