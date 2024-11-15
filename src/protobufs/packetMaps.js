import { PACKET_TYPE } from '../constants/header.js';

// 각 PACKET_TYPE 객체의 값을 GamePacket 메시지의 oneof payload 필드와 연결하는 매핑 파일
const PACKET_MAPS = {
  // 회원가입 및 로그인
  [PACKET_TYPE.REGISTER_REQUEST]: 'registerRequest',
  [PACKET_TYPE.REGISTER_RESPONSE]: 'registerResponse',
  [PACKET_TYPE.LOGIN_REQUEST]: 'loginRequest',
  [PACKET_TYPE.LOGIN_RESPONSE]: 'loginResponse',

  // 방생성
  [PACKET_TYPE.CREATE_ROOM_REQUEST]: 'createRoomRequest',
  [PACKET_TYPE.CREATE_ROOM_RESPONSE]: 'createRoomResponse',
  // 방 목록 조회
  [PACKET_TYPE.GET_ROOM_LIST_REQUEST]: 'getRoomListRequest',
  [PACKET_TYPE.GET_ROOM_LIST_RESPONSE]: 'getRoomListResponse',
  // 방 참가
  [PACKET_TYPE.JOIN_ROOM_REQUEST]: 'joinRoomRequest',
  [PACKET_TYPE.JOIN_ROOM_RESPONSE]: 'joinRoomResponse',
  // 랜덤 방 참가
  [PACKET_TYPE.JOIN_RANDOM_ROOM_REQUEST]: 'joinRandomRoomRequest',
  [PACKET_TYPE.JOIN_RANDOM_ROOM_RESPONSE]: 'joinRandomRoomResponse',
  // 방 참가 알림
  [PACKET_TYPE.JOIN_ROOM_NOTIFICATION]: 'joinRoomNotification',
  // 방 나가기
  [PACKET_TYPE.LEAVE_ROOM_REQUEST]: 'leaveRoomRequest',
  [PACKET_TYPE.LEAVE_ROOM_RESPONSE]: 'leaveRoomResponse',
  // 방 나가기 알림
  [PACKET_TYPE.LEAVE_ROOM_NOTIFICATION]: 'leaveRoomNotification',

  // 게임 시작 전, 역할 및 캐릭터 셔플 요청
  [PACKET_TYPE.GAME_PREPARE_REQUEST]: 'gamePrepareRequest',
  [PACKET_TYPE.GAME_PREPARE_RESPONSE]: 'gamePrepareResponse',
  [PACKET_TYPE.GAME_PREPARE_NOTIFICATION]: 'gamePrepareNotification',

  // 게임 시작
  [PACKET_TYPE.GAME_START_REQUEST]: 'gameStartRequest',
  [PACKET_TYPE.GAME_START_RESPONSE]: 'gameStartResponse',
  [PACKET_TYPE.GAME_START_NOTIFICATION]: 'gameStartNotification',

  // 위치 업데이트
  [PACKET_TYPE.POSITION_UPDATE_REQUEST]: 'positionUpdateRequest',
  [PACKET_TYPE.POSITION_UPDATE_RESPONSE]: 'positionUpdateResponse',
  [PACKET_TYPE.POSITION_UPDATE_NOTIFICATION]: 'positionUpdateNotification',

  // 카드 사용
  [PACKET_TYPE.USE_CARD_REQUEST]: 'useCardRequest',
  [PACKET_TYPE.USE_CARD_RESPONSE]: 'useCardResponse',
  // 카드 사용 알림
  [PACKET_TYPE.USE_CARD_NOTIFICATION]: 'useCardNotification',
  [PACKET_TYPE.EQUIP_CARD_NOTIFICATION]: 'equipCardNotification',
  [PACKET_TYPE.CARD_EFFECT_NOTIFICATION]: 'cardEffectNotification',

  // 플리마켓
  [PACKET_TYPE.FLEA_MARKET_NOTIFICATION]: 'fleaMarketNotification',
  [PACKET_TYPE.FLEA_MARKET_PICK_REQUEST]: 'fleaMarketPickRequest',
  [PACKET_TYPE.FLEA_MARKET_PICK_RESPONSE]: 'fleaMarketPickResponse',

  // 유저 정보 업데이트 알림(카드 사용, 체력 감소)
  [PACKET_TYPE.USER_UPDATE_NOTIFICATION]: 'userUpdateNotification',

  // 페이즈 업데이트
  [PACKET_TYPE.PHASE_UPDATE_NOTIFICATION]: 'phaseUpdateNotification',

  // 리액션
  [PACKET_TYPE.REACTION_REQUEST]: 'recationRequest',
  [PACKET_TYPE.REACTION_RESPONSE]: 'recationResponse',

  // 턴 종료 시 카드 버리기
  [PACKET_TYPE.DESTROY_CARD_REQUEST]: 'destroyCardRequest',
  [PACKET_TYPE.DESTROY_CARD_RESPONSE]: 'destroyCardResponse',

  // 게임 종료
  [PACKET_TYPE.GAME_END_NOTIFICATION]: 'gameEndNotification',

  // 카드 선택
  [PACKET_TYPE.CARD_SELECT_REQUEST]: 'cardSelectRequest',
  [PACKET_TYPE.CARD_SELECT_RESPONSE]: 'cardSelectResponse',

  // 디버프 넘기기
  [PACKET_TYPE.PASS_DEBUFF_REQUEST]: 'passDebuffRequest',
  [PACKET_TYPE.PASS_DEBUFF_RESPONSE]: 'passDebuffResponse',
  [PACKET_TYPE.WARNING_NOTIFICATION]: 'warningNotification',

  // 효과 알림
  [PACKET_TYPE.ANIMATION_NOTIFICATION]: 'animationNotification',
};

export default PACKET_MAPS;
