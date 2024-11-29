import config from '../../config/config.js';

const {
  packet: { packetType: PACKET_TYPE },
  winType: WIN_TYPE,
  role: { roleType: ROLE_TYPE },
  character: { characterStateType: CHARACTER_STATE_TYPE },
  interval: INTERVAL,
  intervalType: INTERVAL_TYPE,
} = config;

export const deathMatchInterval = (game, user) => {
  if (game.getCharacter(user.id).stateInfo.state !== CHARACTER_STATE_TYPE.DEATH_MATCH_TURN_STATE) {
    return;
  }
  const targetId = game.getCharacter(user.id).stateInfo.stateTargetUserId;

  console.log(`빵야나 피해입는걸 선택 안함`);

  if (
    game.getCharacter(targetId).stateInfo.state === CHARACTER_STATE_TYPE.DEATH_MATCH_STATE &&
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
};
