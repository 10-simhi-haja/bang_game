import config from '../../config/config.js';

const {
  character: { characterType: CHARACTER_TYPE, characterStateType: CHARACTER_STATE_TYPE },
} = config;

class CharacterStateInfoData {
  constructor() {
    this.state = CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE;
    this.nextState = CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE;
    this.nextStateAt = 0;
    this.stateTargetUserId = 0;
  }
}

export default CharacterStateInfoData;
