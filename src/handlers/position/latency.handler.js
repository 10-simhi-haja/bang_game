import { getUserBySocket } from '../../sessions/user.session.js';

// 로그인 응답 시간을 저장하는 Map
const loginResponseTimes = new Map();

export const handleLoginResponse = ({ socket }) => {
  const currentTime = Date.now();
  const currentUser = getUserBySocket(socket);

  if (!currentUser) {
    console.error('유저가 존재하지 않습니다.');
    return;
  }

  const userId = currentUser.id;
  loginResponseTimes.set(userId, currentTime);
  console.log(`User ${userId} login response time recorded at ${currentTime}`);
};

export default handleLoginResponse;

export { loginResponseTimes };
