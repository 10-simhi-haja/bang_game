import CustomError from '../utils/errors/customError.js';
import ErrorCodes from './../utils/errors/errorCodes';

const handlers = {};

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
