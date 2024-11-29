export const bbangInterval = (game, user) => {};

// if (reactionType === REACTION_TYPE.NONE_REACTION) {
//   console.log('피해받기 선택');
//   if (room.users && room.users[user.id] && room.users[user.id].character.hp > 0) {
//     room.users[user.id].character.hp -= 1;
//     console.log(`유저 체력: ${room.users[user.id].character.hp}`);
//     room.users[user.id].character.shooterArr.shift();
//   } else {
//     console.error(`User with id ${user.id} not found in room users or already dead.`);
//   }
//   // 리셋을 전체유저에게 하는게 아니라
//   // 나랑 나를 공격한 사람을 리셋해야함.
//   // room.resetStateInfoAllUsers();
//   const target = room.getCharacter(user.id);
//   const targetId = target.stateInfo.stateTargetUserId;
//   room.setCharacterState(
//     user.id,
//     CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
//     CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
//     0,
//     0,
//   );
//   room.setCharacterState(
//     room.users[targetId].user.id,
//     CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
//     CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
//     0,
//     0,
//   );
//   // userUpdateNotification(room);
// }
