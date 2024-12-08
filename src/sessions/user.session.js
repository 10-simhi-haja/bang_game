import User from '../classes/models/user.class.js';
import { v4 as uuidv4 } from 'uuid';
import { userSessions } from './sessions.js';
import CustomError from '../utils/errors/customError.js';
import ErrorCodes from '../utils/errors/errorCodes.js';

export const addUser = async (socket, accountId, nickname) => {
  const user = new User(socket, accountId, nickname);
  userSessions.push(user);
  return user;
};

export const removeUserBySocket = async (socket) => {
  const index = userSessions.findIndex((user) => user.socket === socket);

  if (index !== -1) {
    return userSessions.splice(index, 1)[0];
  }
};

export const getUserById = (id) => {
  return userSessions.find((user) => user.id == id);
};

export const getUserByDeviceId = (deviceId) => {
  return userSessions.find((user) => user.deviceId === deviceId);
};

export const getUserBySocket = (socket) => {
  const user = userSessions.find((user) => user.socket === socket);
  if (!user) {
    throw new CustomError(ErrorCodes.USER_NOT_FOUND, '유저를 찾을 수 없다.', socket.sequence);
  }
  return user;
};

export const getUserSessions = () => {
  return userSessions;
};
