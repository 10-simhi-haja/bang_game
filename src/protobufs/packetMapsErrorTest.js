import { PACKET_TYPE } from '../constants/header.js';

// 각 PACKET_TYPE 객체의 값을 GamePacket 메시지의 oneof payload 필드와 연결하는 매핑 파일
const PACKET_MAPS_ERROR_TEST = {
  // 회원가입 및 로그인
  [PACKET_TYPE.REGISTER_REQUEST]: 'C2SRegisterRequest',
  [PACKET_TYPE.REGISTER_RESPONSE]: 'S2CRegisterResponse',
  [PACKET_TYPE.LOGIN_REQUEST]: 'C2SLoginRequest',
  [PACKET_TYPE.LOGIN_RESPONSE]: 'S2CLoginResponse',

  // 방생성
  [PACKET_TYPE.CREATE_ROOM_REQUEST]: 'C2SCreateRoomRequest',
  [PACKET_TYPE.CREATE_ROOM_RESPONSE]: 'S2CCreateRoomResponse',
  // 방 목록 조회
  [PACKET_TYPE.GET_ROOM_LIST_REQUEST]: 'C2SGetRoomListRequest',
  [PACKET_TYPE.GET_ROOM_LIST_RESPONSE]: 'S2CGetRoomListResponse',
  // 방 참가
  [PACKET_TYPE.JOIN_ROOM_REQUEST]: 'C2SJoinRoomRequest',
  [PACKET_TYPE.JOIN_ROOM_RESPONSE]: 'S2CJoinRoomResponse',
  // 랜덤 방 참가
  [PACKET_TYPE.JOIN_RANDOM_ROOM_REQUEST]: 'C2SJoinRandomRoomRequest',
  [PACKET_TYPE.JOIN_RANDOM_ROOM_RESPONSE]: 'S2CJoinRandomRoomResponse',
  // 방 참가 알림
  [PACKET_TYPE.JOIN_ROOM_NOTIFICATION]: 'S2CJoinRoomNotification',
  // 방 나가기
  [PACKET_TYPE.LEAVE_ROOM_REQUEST]: 'C2SLeaveRoomRequest',
  [PACKET_TYPE.LEAVE_ROOM_RESPONSE]: 'S2CLeaveRoomResponse',
  // 방 나가기 알림
  [PACKET_TYPE.LEAVE_ROOM_NOTIFICATION]: 'S2CLeaveRoomNotification',

  // 게임 시작 전, 역할 및 캐릭터 셔플 요청
  [PACKET_TYPE.GAME_PREPARE_REQUEST]: 'C2SGamePrepareRequest',
  [PACKET_TYPE.GAME_PREPARE_RESPONSE]: 'S2CGamePrepareResponse',
  [PACKET_TYPE.GAME_PREPARE_NOTIFICATION]: 'S2CGamePrepareNotification',

  // 게임 시작
  [PACKET_TYPE.GAME_START_REQUEST]: 'C2SGameStartRequest',
  [PACKET_TYPE.GAME_START_RESPONSE]: 'S2CGameStartResponse',
  [PACKET_TYPE.GAME_START_NOTIFICATION]: 'S2CGameStartNotification',

  // 위치 업데이트
  [PACKET_TYPE.POSITION_UPDATE_REQUEST]: 'C2SPositionUpdateRequest',
  [PACKET_TYPE.POSITION_UPDATE_RESPONSE]: 'S2CPositionUpdateResponse',
  [PACKET_TYPE.POSITION_UPDATE_NOTIFICATION]: 'S2CPositionUpdateNotification',

  // 카드 사용
  [PACKET_TYPE.USE_CARD_REQUEST]: 'C2SUseCardRequest',
  [PACKET_TYPE.USE_CARD_RESPONSE]: 'S2CUseCardResponse',
  // 카드 사용 알림
  [PACKET_TYPE.USE_CARD_NOTIFICATION]: 'S2CUseCardNotification',
  [PACKET_TYPE.EQUIP_CARD_NOTIFICATION]: 'S2CEquipCardNotification',
  [PACKET_TYPE.CARD_EFFECT_NOTIFICATION]: 'S2CCardEffectNotification',

  // 플리마켓
  [PACKET_TYPE.FLEA_MARKET_NOTIFICATION]: 'S2CFleaMarketNotification',
  [PACKET_TYPE.FLEA_MARKET_PICK_REQUEST]: 'C2SFleaMarketPickRequest',
  [PACKET_TYPE.FLEA_MARKET_PICK_RESPONSE]: 'S2CFleaMarketPickResponse',

  // 유저 정보 업데이트 알림(카드 사용, 체력 감소)
  [PACKET_TYPE.USER_UPDATE_NOTIFICATION]: 'S2CUserUpdateNotification',

  // 페이즈 업데이트
  [PACKET_TYPE.PHASE_UPDATE_NOTIFICATION]: 'S2CPhaseUpdateNotification',

  // 리액션
  [PACKET_TYPE.REACTION_REQUEST]: 'C2SReactionRequest',
  [PACKET_TYPE.REACTION_RESPONSE]: 'S2CReactionResponse',

  // 턴 종료 시 카드 버리기
  [PACKET_TYPE.DESTROY_CARD_REQUEST]: 'C2SDestroyCardRequest',
  [PACKET_TYPE.DESTROY_CARD_RESPONSE]: 'S2CDestroyCardResponse',

  // 게임 종료
  [PACKET_TYPE.GAME_END_NOTIFICATION]: 'S2CGameEndNotification',

  // 카드 선택
  [PACKET_TYPE.CARD_SELECT_REQUEST]: 'C2SCardSelectRequest',
  [PACKET_TYPE.CARD_SELECT_RESPONSE]: 'S2CCardSelectResponse',

  // 디버프 넘기기
  [PACKET_TYPE.PASS_DEBUFF_REQUEST]: 'C2SPassDebuffRequest',
  [PACKET_TYPE.PASS_DEBUFF_RESPONSE]: 'S2CPassDebuffResponse',
  [PACKET_TYPE.WARNING_NOTIFICATION]: 'S2CWarningNotification',

  // 효과 알림
  [PACKET_TYPE.ANIMATION_NOTIFICATION]: 'S2CAnimationNotification',
};

export default PACKET_MAPS_ERROR_TEST;
