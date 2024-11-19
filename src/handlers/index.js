import CustomError from '../utils/errors/customError.js';
import ErrorCodes from './../utils/errors/errorCodes.js';
import config from '../config/config.js';
import handlePositionUpdate from './syncCharacter/position.handler.js';
import registerHandler from './user/registerHandler.js';
import handleUserUpdate from './syncCharacter/userUpdate.handler.js';
import loginHandler from './user/loginHandler.js';

import roomListHandler from './room/roomListHandler.js';
import createRoomHandler from './room/createRoomHandler.js';
import joinRoomHandler from './room/joinRoomHandler.js';

const { packetType } = config.packet;

const handlers = {
  [packetType.REGISTER_REQUEST]: {
    handler: registerHandler,
    protoType: 'C2SRegisterRequest',
  },
  [packetType.REGISTER_RESPONSE]: {
    handler: undefined,
    protoType: 'auth.C2SRegisterResponse',
  },
  [packetType.LOGIN_REQUEST]: {
    handler: loginHandler,
    protoType: 'auth.C2SLoginRequest',
  },
  [packetType.LOGIN_RESPONSE]: {
    handler: undefined,
    protoType: 'auth.S2CLoginResponse', ///
  },
  [packetType.CREATE_ROOM_REQUEST]: {
    handler: createRoomHandler,
    protoType: 'room.C2SCreateRoomRequest',
  },
  [packetType.CREATE_ROOM_RESPONSE]: {
    handler: undefined,
    protoType: 'room.S2CCreateRoomResponse',
  },
  [packetType.GET_ROOM_LIST_REQUEST]: {
    handler: roomListHandler,
    protoType: 'room.C2SGetRoomListRequest',
  },
  [packetType.GET_ROOM_LIST_RESPONSE]: {
    handler: undefined,
    protoType: 'room.S2CGetRoomListResponse',
  },
  [packetType.JOIN_ROOM_REQUEST]: {
    handler: joinRoomHandler,
    protoType: 'room.C2SJoinRoomRequest',
  },
  [packetType.JOIN_ROOM_RESPONSE]: {
    handler: undefined,
    protoType: 'room.S2CJoinRoomResponse',
  },
  [packetType.JOIN_RANDOM_ROOM_REQUEST]: {
    handler: undefined,
    protoType: 'room.C2SJoinRandomRoomRequest',
  },
  [packetType.JOIN_RANDOM_ROOM_RESPONSE]: {
    handler: undefined,
    protoType: 'room.S2CJoinRandomRoomResponse',
  },
  [packetType.JOIN_ROOM_NOTIFICATION]: {
    handler: undefined,
    protoType: 'room.S2CJoinRoomNotification',
  },
  [packetType.LEAVE_ROOM_REQUEST]: {
    handler: leaveRoomHandler,
    protoType: 'room.C2SLeaveRoomRequest',
  },
  [packetType.LEAVE_ROOM_RESPONSE]: {
    handler: undefined,
    protoType: 'room.S2CLeaveRoomResponse',
  },
  [packetType.LEAVE_ROOM_NOTIFICATION]: {
    handler: undefined,
    protoType: 'room.S2CLeaveRoomNotification',
  },
  [packetType.GAME_PREPARE_REQUEST]: {
    handler: undefined,
    protoType: 'gameState.C2SGamePrepareRequest',
  },
  [packetType.GAME_PREPARE_RESPONSE]: {
    handler: undefined,
    protoType: 'gameState.S2CGamePrepareResponse',
  },
  [packetType.GAME_PREPARE_NOTIFICATION]: {
    handler: undefined,
    protoType: 'gameState.S2CGamePrepareNotification',
  },
  [packetType.GAME_START_REQUEST]: {
    handler: undefined,
    protoType: 'gameState.C2SGameStartRequest',
  },
  [packetType.GAME_START_RESPONSE]: {
    handler: undefined,
    protoType: 'gameState.C2SGameStartResponse',
  },
  [packetType.GAME_START_NOTIFICATION]: {
    handler: undefined,
    protoType: 'gameState.C2SGameStartNotification',
  },
  [packetType.POSITION_UPDATE_REQUEST]: {
    handler: handlePositionUpdate,
    protoType: 'game.C2SPositionUpdateRequest',
  },
  [packetType.POSITION_UPDATE_NOTIFICATION]: {
    handler: undefined,
    protoType: 'game.S2CPositionUpdateNotification',
  },
  [packetType.USE_CARD_REQUEST]: {
    handler: undefined,
    protoType: 'game.C2SUseCardRequest',
  },
  [packetType.USE_CARD_RESPONSE]: {
    handler: undefined,
    protoType: 'game.S2CUseCardResponse',
  },
  [packetType.USE_CARD_NOTIFICATION]: {
    handler: undefined,
    protoType: 'game.S2CUseCardNotification',
  },
  [packetType.EQUIP_CARD_NOTIFICATION]: {
    handler: undefined,
    protoType: 'game.S2CEquipCardNotification',
  },
  [packetType.CARD_EFFECT_NOTIFICATION]: {
    handler: undefined,
    protoType: 'game.S2CCardEffectNotification ',
  },
  [packetType.FLEA_MARKET_NOTIFICATION]: {
    handler: undefined,
    protoType: 'game.S2CFleaMarketNotification',
  },
  [packetType.FLEA_MARKET_PICK_REQUEST]: {
    handler: undefined,
    protoType: 'game.C2SFleaMarketPickRequest',
  },
  [packetType.FLEA_MARKET_PICK_RESPONSE]: {
    handler: undefined,
    protoType: 'game.S2CFleaMarketPickResponse',
  },
  [packetType.USER_UPDATE_NOTIFICATION]: {
    handler: handleUserUpdate,
    protoType: 'game.S2CUserUpdateNotification',
  },
  [packetType.PHASE_UPDATE_NOTIFICATION]: {
    handler: undefined,
    protoType: 'game.S2CPhaseUpdateNotification',
  },
  [packetType.REACTION_REQUEST]: {
    handler: undefined,
    protoType: 'game.C2SReactionRequest',
  },
  [packetType.REACTION_RESPONSE]: {
    handler: undefined,
    protoType: 'game.S2CReactionResponse',
  },
  [packetType.DESTROY_CARD_REQUEST]: {
    handler: handleDestroyCardRequest,
    protoType: 'game.C2SDestroyCardRequest',
  },
  [packetType.DESTROY_CARD_RESPONSE]: {
    handler: undefined,
    protoType: 'game.S2CDestroyCardResponse',
  },
  [packetType.GAME_END_NOTIFICATION]: {
    handler: undefined,
    protoType: 'game.S2CGameEndNotification',
  },
  [packetType.CARD_SELECT_REQUEST]: {
    handler: undefined,
    protoType: 'game.C2SCardSelectRequest',
  },
  [packetType.CARD_SELECT_RESPONSE]: {
    handler: undefined,
    protoType: 'game.S2CCardSelectResponse',
  },
  [packetType.PASS_DEBUFF_REQUEST]: {
    handler: undefined,
    protoType: 'game.C2SPassDebuffRequest',
  },
  [packetType.PASS_DEBUFF_RESPONSE]: {
    handler: undefined,
    protoType: 'game.S2CPassDebuffResponse',
  },
  [packetType.WARNING_NOTIFICATION]: {
    handler: undefined,
    protoType: 'game.S2CWarningNotification',
  },
  [packetType.ANIMATION_NOTIFICATION]: {
    handler: undefined,
    protoType: 'game.S2CAnimationNotification',
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
