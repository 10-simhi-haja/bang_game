import { removeUserBySocket } from '../sessions/user.session.js';

// 종료되면 해당 유저 게임에서 제거하는 과정.
export const onEnd = (socket) => async () => {
  console.log('클라이언트와 연결이 종료되었다!!!!');
  removeUserBySocket(socket);
};

export default onEnd;
