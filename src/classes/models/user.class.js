// 핸들러 구현을 위해 임시로 작성한 로직, 돌아가는지 확인이 불가능 하기에 팀원들 코드로 대체 예정
class User {
  // 다수의 유저 데이터를 담아야하기 때문에 배열로 저장
  constructor(socket, id, nickname, character) {
    this.socket = socket;
    this.id = id;
    this.nickname = nickname;
    this.character = character;
  }

  addUser(user) {
    this.users.push(user);
  }

  removeUser(socket) {
    this.users = this.users.filter((user) => user.socket !== socket);
  }

  getUserById(userId) {
    return this.users.find((user) => user.id === userId);
  }

  getUserBySocket(socket) {
    return this.users.find((user) => user.socket === socket);
  }

  getUsers() {
    return this.users;
  }
}

export default User;
