import { PACKET_TYPE } from '../constants/header.js';
import CustomError from '../utils/errors/customError.js';
import ErrorCodes from './../utils/errors/errorCodes.js';

const handlers = {
  // [PACKET_TYPE.REGISTER_REQUEST]: {
  //   handler: test,
  //   protoType: 'test',
  // },
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
