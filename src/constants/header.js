/** 패킷 헤더에 대해 정의된 파일 */
export const TOTAL_HEADER_LENGTH = 12;
export const PAYLOAD_ONEOF_CASE_LENGTH = 2;
export const VERSION_LENGTH = 1;
export const SEQUENCE_LENGTH = 4;
export const PAYLOAD_LENGTH = 4;

export const PACKET_TYPE = {
  // 회원가입 및 로그인
  REGISTER_REQUEST: 1,
  REGISTER_RESPONSE: 2,
  LOGIN_REQUEST: 3,
  LOGIN_RESPONSE: 4,

  // 방 생성
  CREATE_ROOM_REQUEST: 5,
  CREATE_ROOM_RESPONSE: 6,
  // 방 목록 조회
  GET_ROOM_LIST_REQUEST: 7,
  GET_ROOM_LIST_RESPONSE: 8,
  // 방 참가
  JOIN_ROOM_REQUEST: 9,
  JOIN_ROOM_RESPONSE: 10,
  // 랜덤 방 참가
  JOIN_RANDOM_ROOM_REQUEST: 11,
  JOIN_RANDOM_ROOM_RESPONSE: 12,
  // 방 참가 알림
  JOIN_ROOM_NOTIFICATION: 13,
  // 방 나가기
  LEAVE_ROOM_REQUEST: 14,
  LEAVE_ROOM_RESPONSE: 15,
  // 방 나가기 알림
  LEAVE_ROOM_NOTIFICATION: 16,

  // 게임 시작 전, 역할 및 캐릭터 셔플 요청
  GAME_PREPARE_REQUEST: 17,
  GAME_PREPARE_RESPONSE: 18,
  GAME_PREPARE_NOTIFICATION: 19,

  // 게임 시작
  GAME_START_REQUEST: 20,
  GAME_START_RESPONSE: 21,
  GAME_START_NOTIFICATION: 22,

  // 위치 업데이트
  POSITION_UPDATE_REQUEST: 23,
  POSITION_UPDATE_NOTIFICATION: 24,

  // 카드 사용
  USE_CARD_REQUEST: 25,
  USE_CARD_RESPONSE: 26,
  // 카드 사용 알림
  USE_CARD_NOTIFICATION: 27,
  EQUIP_CARD_NOTIFICATION: 28, // 장비
  CARD_EFFECT_NOTIFICATION: 29, // 장비 효과 발동 시

  // 플리마켓
  FLEA_MARKET_NOTIFICATION: 30,
  FLEA_MARKET_PICK_REQUEST: 31,
  FLEA_MARKET_PICK_RESPONSE: 32,

  // 유저 정보 업데이트 알림(카드 사용, 체력 감소..)
  USER_UPDATE_NOTIFICATION: 33,

  // 페이즈 업데이트
  PHASE_UPDATE_NOTIFICATION: 34,

  // 리액션
  REACTION_REQUEST: 35,
  REACTION_RESPONSE: 36,

  // 턴 종료시 카드 버리기
  DESTROY_CARD_REQUEST: 37,
  DESTROY_CARD_RESPONSE: 38,

  // 게임 종료
  GAME_END_NOTIFICATION: 39,

  // 카드 선택
  CARD_SELECT_REQUEST: 40,
  CARD_SELECT_RESPONSE: 41,

  // 디버프 넘기기
  PASS_DEBUFF_REQUEST: 42,
  PASS_DEBUFF_RESPONSE: 43,
  WARNING_NOTIFICATION: 44, // 폭탄

  // 효과 알림
  ANIMATION_NOTIFICATION: 45,
};

export const CHARACTER_TYPE = {
  NONE_CHARACTER: 0,
  RED: 1, // 빨강이
  SHARK: 3, // 상어군
  MALANG: 5, // 말랑이
  FROGGY: 7, // 개굴군
  PINK: 8, // 핑크군
  SWIM_GLASSES: 9, // 물안경군
  MASK: 10, // 가면군
  DINOSAUR: 12, // 공룡이
  PINK_SLIME: 13, // 핑크슬라임
};

export const CARD_TYPE = {
  NONE: 0,
  BBANG: 1, // 20장
  BIG_BBANG: 2, // 1장
  SHIELD: 3, // 10장
  VACCINE: 4, // 6장
  CALL_119: 5, // 2장
  DEATH_MATCH: 6, // 4장
  GUERRILLA: 7, // 1장
  ABSORB: 8, // 4장
  HALLUCINATION: 9, // 4장
  FLEA_MARKET: 10, // 3장
  MATURED_SAVINGS: 11, // 2장
  WIN_LOTTERY: 12, // 1장
  SNIPER_GUN: 13, // 1장
  HAND_GUN: 14, // 2장
  DESERT_EAGLE: 15, // 3장
  AUTO_RIFLE: 16, // 2장
  LASER_POINTER: 17, // 1장
  RADAR: 18, // 1장
  AUTO_SHIELD: 19, // 2장
  STEALTH_SUIT: 20, // 2장
  CONTAINMENT_UNIT: 21, // 3장
  SATELLITE_TARGET: 22, // 1장
  BOMB: 23, // 1장
};

export const ROLE_TYPE = {
  NONE_ROLE: 0,
  TARGET: 1,
  BODYGUARD: 2,
  HITMAN: 3,
  PSYCHOPATH: 4,
};

// - 2인 : 타겟1, 히트맨1
// - 3인 : 타겟1, 히트맨1, 싸이코패스1
// - 4인 : 타겟1, 히트맨2, 싸이코패스1
// - 5인 : 타겟1, 보디가드1, 히트맨2, 싸이코패스1
// - 6인 : 타겟1, 보디가드1, 히트맨3, 싸이코패스1
// - 7인 : 타겟1, 보디가드2, 히트맨3, 싸이코패스1
export const ROLES_DISTRIBUTION = {
  2: { TARGET: 1, HITMAN: 1 },
  3: { TARGET: 1, HITMAN: 1, PSYCHOPATH: 1 },
  4: { TARGET: 1, HITMAN: 2, PSYCHOPATH: 1 },
  5: { TARGET: 1, BODYGUARD: 1, HITMAN: 2, PSYCHOPATH: 1 },
  6: { TARGET: 1, BODYGUARD: 1, HITMAN: 3, PSYCHOPATH: 1 },
  7: { TARGET: 1, BODYGUARD: 2, HITMAN: 3, PSYCHOPATH: 1 },
};

export const CHARACTER_STATE_TYPE = {
  NONE_CHARACTER_STATE: 0,
  BBANG_SHOOTER: 1, // 빵야 시전자
  BBANG_TARGET: 2, // 빵야 대상 (쉴드 사용가능 상태)
  DEATH_MATCH_STATE: 3, // 현피 중 자신의 턴이 아닐 때
  DEATH_MATCH_TURN_STATE: 4, // 현피 중 자신의 턴
  FLEA_MARKET_TURN: 5, // 플리마켓 자신의 턴
  FLEA_MARKET_WAIT: 6, // 플리마켓 턴 대기 상태
  GUERRILLA_SHOOTER: 7, // 게릴라 시전자
  GUERRILLA_TARGET: 8, // 게릴라 대상
  BIG_BBANG_SHOOTER: 9, // 난사 시전자
  BIG_BBANG_TARGET: 10, // 난사 대상
  ABSORBING: 11, // 흡수 중
  ABSORB_TARGET: 12, // 흡수 대상
  HALLUCINATING: 13, // 신기루 중
  HALLUCINATION_TARGET: 14, // 신기루 대상
  CONTAINED: 15, // 감금 중
};

export const ROOM_STATE_TYPE = {
  WAIT: 0,
  PREPARE: 1,
  INGAME: 2,
};

export const GLOBAL_FAIL_CODE = {
  NONE_FAILCODE: 0,
  UNKNOWN_ERROR: 1,
  INVALID_REQUEST: 2,
  AUTHENTICATION_FAILED: 3,
  CREATE_ROOM_FAILED: 4,
  JOIN_ROOM_FAILED: 5,
  LEAVE_ROOM_FAILED: 6,
  REGISTER_FAILED: 7,
  ROOM_NOT_FOUND: 8,
  CHARACTER_NOT_FOUND: 9,
  CHARACTER_STATE_ERROR: 10,
  CHARACTER_NO_CARD: 11,
  INVALID_ROOM_STATE: 12,
  NOT_ROOM_OWNER: 13,
  ALREADY_USED_BBANG: 14,
  INVALID_PHASE: 15,
  CHARACTER_CONTAINED: 16,
};

export const WARNING_TYPE = {
  NO_WARNING: 0,
  BOMB_WARNING: 1,
};

export const REACTION_TYPE = {
  NONE_REACTION: 0,
  NOT_USE_CARD: 1,
};

export const CHARACTER_SPAWN_POINT = [
  { x: -3.972, y: 3.703 },
  { x: 10.897, y: 4.033 },
  { x: 11.737, y: -5.216 },
  { x: 5.647, y: -5.126 },
  { x: -6.202, y: -5.126 },
  { x: -13.262, y: 4.213 },
  { x: -22.742, y: 3.653 },
  { x: -21.622, y: -6.936 },
  { x: -24.732, y: -6.886 },
  { x: -15.702, y: 6.863 },
  { x: -1.562, y: 6.173 },
  { x: -13.857, y: 6.073 },
  { x: 5.507, y: 11.963 },
  { x: -18.252, y: 12.453 },
  { x: -1.752, y: -7.376 },
  { x: 21.517, y: -4.826 },
  { x: 21.717, y: 3.223 },
  { x: 23.877, y: 10.683 },
  { x: 15.337, y: -12.296 },
  { x: -15.202, y: -4.736 },
];

export const PHASE_TYPE = {
  DAY: 1,
  // EVENING: 2, 필요시 추가,
  END: 3,
};

// 인터벌 주기
// 필요한 주기가 있으면 추가해서 사용.
export const INTERVAL = {
  SYNC_POSITION: 1000,
  SYNC_GAME: 1000,
  PHASE_UPDATE_DAY: 5, // 초단위
  PHASE_UPDATE_END: 300, // 초단위
};

export const INTERVAL_TYPE = {
  POSITION: 0,
  PHASE_UPDATE: 1,
  GAME_UPDATE: 2,
};

export const WIN_TYPE = {
  TARGET_AND_BODYGUARD_WIN: 0,
  HITMAN_WIN: 1,
  PSYCHOPATH_WIN: 2,
};

export const CARD_POOL = {
  [CARD_TYPE.NONE]: 0,
  [CARD_TYPE.BBANG]: 20,
  [CARD_TYPE.BIG_BBANG]: 1,
  [CARD_TYPE.SHIELD]: 10,
  [CARD_TYPE.VACCINE]: 6,
  [CARD_TYPE.CALL_119]: 2,
  [CARD_TYPE.DEATH_MATCH]: 4,
  [CARD_TYPE.GUERRILLA]: 1,
  [CARD_TYPE.ABSORB]: 4,
  [CARD_TYPE.HALLUCINATION]: 4,
  [CARD_TYPE.FLEA_MARKET]: 3,
  [CARD_TYPE.MATURED_SAVINGS]: 2,
  [CARD_TYPE.WIN_LOTTERY]: 1,
  [CARD_TYPE.SNIPER_GUN]: 1,
  [CARD_TYPE.HAND_GUN]: 2,
  [CARD_TYPE.DESERT_EAGLE]: 3,
  [CARD_TYPE.AUTO_RIFLE]: 2,
  [CARD_TYPE.LASER_POINTER]: 1,
  [CARD_TYPE.RADAR]: 1,
  [CARD_TYPE.AUTO_SHIELD]: 2,
  [CARD_TYPE.STEALTH_SUIT]: 2,
  [CARD_TYPE.CONTAINMENT_UNIT]: 3,
  [CARD_TYPE.SATELLITE_TARGET]: 1,
  [CARD_TYPE.BOMB]: 1,
};
