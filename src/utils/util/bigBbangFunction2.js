import config from '../../config/config.js';

const {
  packet: { packetType: PACKET_TYPE },
  winType: WIN_TYPE,
  role: { roleType: ROLE_TYPE },
  character: { characterStateType: CHARACTER_STATE_TYPE },
  interval: INTERVAL,
  intervalType: INTERVAL_TYPE,
} = config;

export const bigBbangInterval2 = (game, user) => {
  try {
    console.log('빅빵인터벌 실행');
    if (game.getCharacter(user.id).stateInfo.state !== CHARACTER_STATE_TYPE.BIG_BBANG_SHOOTER) {
      return;
    }
    const targetIds = game.getCharacter(user.id).stateInfo.stateTargetUserId;
    console.log(`쉴드나 피해입는걸 선택 안함`);

    // targetIds
    //   .filter((targetId) => {
    //     const character = game.getCharacter(targetId);
    //     return (
    //       character.stateInfo.state === CHARACTER_STATE_TYPE.BIG_BBANG_TARGET &&
    //       game.users[targetId].character.hp > 0
    //     );
    //   })
    //   .forEach((targetId) => {
    //     game.minusHp(targetId);
    //   });
    targetIds
      .filter((targetId) => {
        const character = game.getCharacter(targetId);
        return (
          character &&
          game.users[targetId] &&
          character.stateInfo.state === CHARACTER_STATE_TYPE.BIG_BBANG_TARGET &&
          game.users[targetId].character.hp > 0
        );
      })
      .forEach((targetId) => {
        console.log(`${targetId}의 hp 감소`);
        game.users[targetId].character.hp -= 1;
      });

    game.setCharacterState(
      user.id,
      CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
      CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
      0,
      0,
    );
    targetIds.forEach((targetId) => {
      game.setCharacterState(
        targetId,
        CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
        CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
        0,
        0,
      );
    });
    game.intervalManager.removeIntervalByType(user.id, INTERVAL_TYPE.CHARACTER_STATE);
  } catch (err) {
    console.error(err);
  }
};
