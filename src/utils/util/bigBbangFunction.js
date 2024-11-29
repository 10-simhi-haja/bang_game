import config from '../../config/config.js';

const {
  packet: { packetType: PACKET_TYPE },
  winType: WIN_TYPE,
  role: { roleType: ROLE_TYPE },
  character: { characterStateType: CHARACTER_STATE_TYPE },
  interval: INTERVAL,
  intervalType: INTERVAL_TYPE,
} = config;

export const bigBbangInterval = (game, user) => {
  console.log(`무차별 난사 인터벌 실행`);
  console.log(`빅빵인터벌userId: ${user.id}`);
  console.log(`빅빵인터벌 ${JSON.stringify(game.getCharacter(user.id).stateInfo, null, 2)}`);
  console.log(`bigBbang: ${game.getCharacter(user.id).stateInfo.state}`);
  try {
    if (game.getCharacter(user.id).stateInfo.state !== CHARACTER_STATE_TYPE.BIG_BBANG_SHOOTER) {
      console.log(`무차별 난사 리턴값 없음`);
      return;
    }
    console.log(`무차별 난사의 user: ${user}`);
    const targetId = game.getCharacter(user.id).stateInfo.stateTargetUserId;
    console.log(`무차별 난사의 targetId: ${targetId}`);

    console.log(`쉴드나 피해입는걸 선택 안함`);

    if (
      game.getCharacter(targetId).stateInfo.state === CHARACTER_STATE_TYPE.BIG_BBANG_TARGET &&
      game.users[targetId].character.hp > 0
    ) {
      console.log(`${targetId}의 hp 감소`);
      game.users[targetId].character.hp -= 1;
    }

    game.setCharacterState(
      user.id,
      CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
      CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
      0,
      0,
    );
    game.setCharacterState(
      targetId,
      CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
      CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
      0,
      0,
    );
    game.intervalManager.removeIntervalByType(user.id, INTERVAL_TYPE.CHARACTER_STATE);
  } catch (err) {
    console.error(err);
  }
};
