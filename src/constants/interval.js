// 인터벌 주기
// 필요한 주기가 있으면 추가해서 사용.
// 전부 초단위
export const INTERVAL = {
  SYNC_POSITION: 1,
  SYNC_GAME: 2,
  PHASE_UPDATE_DAY: 300,
  PHASE_UPDATE_END: 60,
  FLEA_MARKET_PICK: 10,
  BOMB: 5,
  BOMB_ANIMATION: 5,
  ATTACK: 10,
};

export const INTERVAL_TYPE = {
  POSITION: 0,
  PHASE_UPDATE: 1,
  GAME_UPDATE: 2,
  CHARACTER_STATE: 3,
  BOMB: 4,
  BOMB_ANIMATION: 5,
};
