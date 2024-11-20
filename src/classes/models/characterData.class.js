import config from '../../config/config.js';

const {
  packet: { packetType: PACKET_TYPE },
  character: { characterType: CHARACTER_TYPE, characterStateType: CHARACTER_STATE_TYPE },
  role: { roleType: ROLE_TYPE, rolesDistribution: ROLES_DISTRIBUTION },
} = config;

class characterData {
  constructor() {
    this.characterType = CHARACTER_TYPE.NONE_CHARACTER;
    this.roleType = ROLE_TYPE.NONE_ROLE;
    this.hp = 0;
    this.weapon = 0;
    this.stateInfo = 0;
    this.equips = []; // 여러개니 배열로
    this.debuffs = [];
    this.handCards = [];
    this.bbangCount = 0;
    this.handCardsCount = 0;
  }
}

export default characterData;

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

// message CharacterStateInfoData {
//   CharacterStateType state = 1;
//   CharacterStateType nextState = 2;
//   int64 nextStateAt = 3; // state가 nextState로 풀리는 밀리초 타임스탬프. state가 NONE이면 0
//   string stateTargetUserId = 4; // state에 target이 있을 경우
// }
