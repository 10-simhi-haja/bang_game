import User from '../classes/models/user.class.js';
import { v4 as uuidv4 } from 'uuid';
import { userSessions } from './sessions.js';

export const addUser = async (socket, token, nickname, character) => {
  const user = new User(socket, token, nickname, character);
  console.log(user);
  //token은 User Class에 의해 userId가 될 겁니다.
  //그래서 토큰을 비교해야한다면 userId로 비교하세요
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
    console.error('User not found: getUserBySocket');
  }
  return user;
};

export const getUserSessions = () => {
  return userSessions;
};
