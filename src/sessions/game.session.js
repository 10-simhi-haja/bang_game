// 핸들러 구현을 위해 임시로 작성한 로직, 돌아가는지 확인이 불가능 하기에 팀원들 코드로 대체 예정
import Game from '../classes/models/game.class.js';
import { gameSessions } from './sessions.js';

export const addGameSession = async (data) => {
  const session = new Game(data);
  gameSessions.push(session);
  return session;
};

export const removeGameSessionById = (id) => {
  const index = gameSessions.findIndex((session) => session.id === id);
  if (index !== -1) {
    // 게임이 본인 지울걸 다 지우고 배열에서 잘라내기
    gameSessions[index].remove();
    return gameSessions.splice(index, 1)[0];
  } else {
    console.log(`지울 게임이 없습니다.`);
  }
};

export const getGameSessionById = (id) => {
  return gameSessions.find((session) => session.id === id);
};

export const getGameSessionBySocket = (socket) => {
  return gameSessions.find((session) =>
    session.getAllUsers().some((user) => user.socket === socket),
  );
};

// 유저가 속한 게임찾기
export const getGameSessionByUser = (user) => {
  return gameSessions.find((session) =>
    session.getAllUsers().some((sessionUser) => sessionUser.id === user.id),
  );
};

export const getAllGameSessions = () => {
  return gameSessions;
};

// export const removeGameSessionByUser = (user) => {
//   const sessionIndex = gameSessions.findIndex((session) =>
//     session.users.some((sessionUser) => sessionUser.id === user.id),
//   );

//   if (sessionIndex !== -1) {
//     const session = gameSessions[sessionIndex];

//     session.removeUser(user.socket);

//     // 모든 유저가 제거되면 세션 삭제
//     if (session.getUsers().length === 0) {
//       gameSessions.splice(sessionIndex, 1);
//     }
//     return session;
//   }
// };

// export const removeGameSession = (socket) => {
//   const sessionIndex = gameSessions.findIndex((session) =>
//     session.users.some((user) => user.socket === socket),
//   );

//   if (sessionIndex !== -1) {
//     const session = gameSessions[sessionIndex];
//     session.removeUser(socket);

//     // 모든 유저가 제거되면 세션 삭제
//     if (session.getUsers().length === 0) {
//       gameSessions.splice(sessionIndex, 1);
//     }
//     return session;
//   }
// };

// export const exitGameSession = (socket) => {
//   const session = getGameSession(socket);
//   if (session) {
//     session.removeUser(socket);
//     if (session.getUsers().length === 0) {
//       removeGameSession(socket);
//     }
//   }
// };
