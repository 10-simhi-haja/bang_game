import config from '../../config/config.js';

const {
  packet: { packetType: PACKET_TYPE },
  globalFailCode: { globalFailCode: GLOBAL_FAIL_CODE },
  character: { characterType: CHARACTER_TYPE, characterStateType: CHARACTER_STATE_TYPE },
  role: { roleType: ROLE_TYPE, rolesDistribution: ROLES_DISTRIBUTION },
  roomStateType: { wait: WAIT, prepare: PREPARE, inGame: INGAME },
  interval: INTERVAL,
  intervalType: INTERVAL_TYPE,
  phaseType: PHASE_TYPE,
  winType: WIN_TYPE,
  card: { cardType: CARD_TYPE },
  animationType: ANIMATION_TYPE,
} = config;

export const bbangInterval = (game, user) => {
  console.log('빵 인터벌 실행');
  console.log(`${game.getCharacter(user.id).stateInfo.state}`);
  if (game.getCharacter(user.id).stateInfo.state !== CHARACTER_STATE_TYPE.BBANG_SHOOTER) {
    return;
  }
  const targetId = game.getCharacter(user.id).stateInfo.stateTargetUserId;
  const character = game.getCharacter(user.id);
  const attCharacter = game.getCharacter(character.stateInfo.stateTargetUserId);

  console.log(`쉴드나 피해입는걸 선택 안함`);

  if (
    game.getCharacter(targetId).stateInfo.state === CHARACTER_STATE_TYPE.BBANG_TARGET &&
    game.users[targetId].character.hp > 0
  ) {
    console.log(`${targetId}의 hp 감소`); // HP 감소부분.
    if (attCharacter.weapon === CARD_TYPE.DESERT_EAGLE) {
      game.damageCharacter(attCharacter, character, 2);
    } else {
      game.damageCharacter(attCharacter, character, 1);
    }
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
