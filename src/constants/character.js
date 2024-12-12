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
