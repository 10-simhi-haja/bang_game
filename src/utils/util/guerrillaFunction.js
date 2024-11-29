import config from '../../config/config.js';

const {
  packet: { packetType: PACKET_TYPE },
  winType: WIN_TYPE,
  role: { roleType: ROLE_TYPE },
  character: { characterStateType: CHARACTER_STATE_TYPE },
  interval: INTERVAL,
  intervalType: INTERVAL_TYPE,
} = config;

export const guerrillaInterval = (game, user) => {
  if (game.getCharacter(user.id).stateInfo.state !== CHARACTER_STATE_TYPE.GUERRILLA_TARGET) {
    return;
  }
  const targetId = game.getCharacter(user.id).stateInfo.stateTargetUserId;

  console.log(`빵야나 피해입는걸 선택 안함`);

  if (
    game.getCharacter(user.id).stateInfo.state === CHARACTER_STATE_TYPE.GUERRILLA_TARGET &&
    game.users[user.id].character.hp > 0
  ) {
    console.log(`${user.id}의 hp 감소`);
    game.users[user.id].character.hp -= 1;
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
