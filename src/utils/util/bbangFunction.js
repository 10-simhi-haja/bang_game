import config from '../../config/config.js';

const {
  character: { characterStateType: CHARACTER_STATE_TYPE },
  card: { cardType: CARD_TYPE },
} = config;

export const bbangInterval = (game, user) => {
  if (game.getCharacter(user.id).stateInfo.state !== CHARACTER_STATE_TYPE.BBANG_SHOOTER) {
    return;
  }
  const targetId = game.getCharacter(user.id).stateInfo.stateTargetUserId;
  const character = game.getCharacter(user.id);
  const attCharacter = game.getCharacter(character.stateInfo.stateTargetUserId);

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
