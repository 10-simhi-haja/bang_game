import CustomError from '../utils/errors/customError.js';
import ErrorCodes from './../utils/errors/errorCodes.js';
import config from '../config/config.js';
import registerHandler from './user/registerHandler.js';

const { packetType } = config.packet;

const handlers = {
  [packetType.REGISTER_REQUEST]: {
    handler: registerHandler,
    protoType: 'C2SRegisterRequest',
  },
  [packetType.REGISTER_RESPONSE]: {
    handler: undefined,
    protoType: 'C2SRegisterResponse',
  },
  [packetType.LOGIN_REQUEST]: {
    handler: undefined,
    protoType: 'C2SLoginRequest',
  },
  [packetType.LOGIN_RESPONSE]: {
    handler: undefined,
    protoType: 'S2CLoginResponse', ///
  },
  [packetType.CREATE_ROOM_REQUEST]: {
    handler: undefined,
    protoType: 'C2SCreateRoomRequest',
  },
  [packetType.CREATE_ROOM_RESPONSE]: {
    handler: undefined,
    protoType: 'S2CCreateRoomResponse',
  },
  [packetType.GET_ROOM_LIST_REQUEST]: {
    handler: undefined,
    protoType: 'C2SGetRoomListRequest',
  },
  [packetType.GET_ROOM_LIST_RESPONSE]: {
    handler: undefined,
    protoType: 'S2CGetRoomListResponse',
  },
  [packetType.JOIN_ROOM_REQUEST]: {
    handler: undefined,
    protoType: 'C2SJoinRoomRequest',
  },
  [packetType.JOIN_ROOM_RESPONSE]: {
    handler: undefined,
    protoType: 'S2CJoinRoomResponse',
  },
  [packetType.JOIN_RANDOM_ROOM_REQUEST]: {
    handler: undefined,
    protoType: 'C2SJoinRandomRoomRequest',
  },
  [packetType.JOIN_RANDOM_ROOM_RESPONSE]: {
    handler: undefined,
    protoType: 'S2CJoinRandomRoomResponse',
  },
  [packetType.JOIN_ROOM_NOTIFICATION]: {
    handler: undefined,
    protoType: 'S2CJoinRoomNotification',
  },
  [packetType.LEAVE_ROOM_REQUEST]: {
    handler: undefined,
    protoType: 'C2SLeaveRoomRequest',
  },
  [packetType.LEAVE_ROOM_RESPONSE]: {
    handler: undefined,
    protoType: 'S2CLeaveRoomResponse',
  },
  [packetType.LEAVE_ROOM_NOTIFICATION]: {
    handler: undefined,
    protoType: 'S2CLeaveRoomNotification',
  },
  [packetType.GAME_PREPARE_REQUEST]: {
    handler: undefined,
    protoType: 'C2SGamePrepareRequest',
  },
  [packetType.GAME_PREPARE_RESPONSE]: {
    handler: undefined,
    protoType: 'S2CGamePrepareResponse',
  },
  [packetType.GAME_PREPARE_NOTIFICATION]: {
    handler: undefined,
    protoType: 'S2CGamePrepareNotification',
  },
  [packetType.GAME_START_REQUEST]: {
    handler: undefined,
    protoType: 'C2SGameStartRequest ',
  },
  [packetType.GAME_START_RESPONSE]: {
    handler: undefined,
    protoType: 'C2SGameStartResponse',
  },
  [packetType.GAME_START_NOTIFICATION]: {
    handler: undefined,
    protoType: 'C2SGameStartNotification',
  },
  [packetType.POSITION_UPDATE_REQUEST]: {
    handler: undefined,
    protoType: 'C2SPositionUpdateRequest',
  },
  [packetType.POSITION_UPDATE_NOTIFICATION]: {
    handler: undefined,
    protoType: 'S2CPositionUpdateNotification',
  },
  [packetType.USE_CARD_REQUEST]: {
    handler: undefined,
    protoType: 'C2SUseCardRequest',
  },
  [packetType.USE_CARD_RESPONSE]: {
    handler: undefined,
    protoType: 'S2CUseCardResponse',
  },
  [packetType.USE_CARD_NOTIFICATION]: {
    handler: undefined,
    protoType: 'S2CUseCardNotification',
  },
  [packetType.EQUIP_CARD_NOTIFICATION]: {
    handler: undefined,
    protoType: 'S2CEquipCardNotification',
  },
  [packetType.CARD_EFFECT_NOTIFICATION]: {
    handler: undefined,
    protoType: 'S2CCardEffectNotification ',
  },
  [packetType.FLEA_MARKET_NOTIFICATION]: {
    handler: undefined,
    protoType: 'S2CFleaMarketNotification',
  },
  [packetType.FLEA_MARKET_PICK_REQUEST]: {
    handler: undefined,
    protoType: 'C2SFleaMarketPickRequest',
  },
  [packetType.FLEA_MARKET_PICK_RESPONSE]: {
    handler: undefined,
    protoType: 'S2CFleaMarketPickResponse',
  },
  [packetType.USER_UPDATE_NOTIFICATION]: {
    handler: undefined,
    protoType: 'S2CUserUpdateNotification',
  },
  [packetType.PHASE_UPDATE_NOTIFICATION]: {
    handler: undefined,
    protoType: 'S2CPhaseUpdateNotification',
  },
  [packetType.REACTION_REQUEST]: {
    handler: undefined,
    protoType: 'C2SReactionRequest',
  },
  [packetType.REACTION_RESPONSE]: {
    handler: undefined,
    protoType: 'S2CReactionResponse',
  },
  [packetType.DESTROY_CARD_REQUEST]: {
    handler: undefined,
    protoType: 'C2SDestroyCardRequest',
  },
  [packetType.DESTROY_CARD_RESPONSE]: {
    handler: undefined,
    protoType: 'S2CDestroyCardResponse',
  },
  [packetType.GAME_END_NOTIFICATION]: {
    handler: undefined,
    protoType: 'S2CGameEndNotification',
  },
  [packetType.CARD_SELECT_REQUEST]: {
    handler: undefined,
    protoType: 'C2SCardSelectRequest',
  },
  [packetType.CARD_SELECT_RESPONSE]: {
    handler: undefined,
    protoType: 'S2CCardSelectResponse',
  },
  [packetType.PASS_DEBUFF_REQUEST]: {
    handler: undefined,
    protoType: 'C2SPassDebuffRequest',
  },
  [packetType.PASS_DEBUFF_RESPONSE]: {
    handler: undefined,
    protoType: 'S2CPassDebuffResponse',
  },
  [packetType.WARNING_NOTIFICATION]: {
    handler: undefined,
    protoType: 'S2CWarningNotification',
  },
  [packetType.ANIMATION_NOTIFICATION]: {
    handler: undefined,
    protoType: 'S2CAnimationNotification',
  },
};

export const getHandlerByPacketType = (PacketType) => {
  if (!handlers[PacketType]) {
    throw new CustomError(ErrorCodes.UNKNOWN_HANDLER_ID, '핸들러 아이디를 찾을 수 없습니다.');
  }
  return handlers[PacketType].handler;
};

export const getProtoTypeNameByPacketType = (PacketType) => {
  if (!handlers[PacketType]) {
    throw new CustomError(ErrorCodes.UNKNOWN_PROTOTYPE_NAME, '프로토타입 이름을 찾을 수 없습니다.');
  }
  return handlers[PacketType].protoType;
};
