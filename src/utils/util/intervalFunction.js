import config from '../../config/config.js';
import fleaMarketNotification from '../notification/fleaMarketNotification.js';
import { createResponse } from '../packet/response/createResponse.js';

const {
  packet: { packetType: PACKET_TYPE },
  globalFailCode: { globalFailCode: GLOBAL_FAIL_CODE },
  character: { characterStateType: CHARACTER_STATE_TYPE },
  interval: INTERVAL,
  intervalType: INTERVAL_TYPE,
} = config;

export const setFleaMarketPickInterval = (game, user) => {
  if (game.getCharacter(user.id).stateInfo.state !== CHARACTER_STATE_TYPE.FLEA_MARKET_TURN) {
    return;
  }

  console.log(`플리마켓 선택안했어`);

  game.fleaMarket.randomPickCard(user);

  game.setAllUserNone();

  if (game.fleaMarket.cards.length > 0) {
    const nextUser = game.getNextUser(user.id);
    fleaMarketNotification(game, nextUser);
  }

  game.intervalManager.removeIntervalByType(user.id, INTERVAL_TYPE.CHARACTER_STATE);
};

export const selectCardInterval = (game, user) => {
  console.log('흡수 인터벌 실행');
  const targetId = game.getCharacter(user.id).stateInfo.stateTargetUserId;
  const character = game.getCharacter(user.id);
  const target = game.getCharacter(character.stateInfo.stateTargetUserId);
  const userHandCards = character.handCards;

  console.log(`흡수 카드 종류 선택 안함`);

  let selectType;
  let selectCardType;
  // 손패 먼저 확인
  if (target.handCardsCount !== 0) {
    selectType = 0;
    const length = target.handCards.length; // 타겟이 손에 들고 있는 카드의 개수
    const index = Math.floor(Math.random() * length);
    selectCardType = target.handCards[index].type;
  } else if (target.equips.length !== 0) {
    selectType = 1;
    const index = Math.floor(Math.random() * target.equips.length);
    selectCardType = target.equips[index].type;
  } else if (target.weapon !== 0) {
    selectType = 2;
    selectCardType = target.weapon;
  } else if (target.debuffs.length !== 0) {
    selectType = 3;
    const index = Math.floor(Math.random() * target.debuffs.length);
    selectCardType = target.debuffs[index].type;
  }

  let chooseCard;
  let cardSelectIndex;
  let chooseHandCard;
  let targetCards;
  let range = 0;
  switch (selectType) {
    case 0: // 핸드
      const length = target.handCards.length; // 타겟이 손에 들고 있는 카드의 개수
      range = Math.floor(Math.random() * length);

      chooseCard = userHandCards.find(
        (card) => card.type === target.handCards[range].type, // 타켓의 손에 있는 카드 중, 랜덤으로 선택
      );
      chooseHandCard = target.handCards[range].type;
      targetCards = target.handCards;
      break;
    case 1: // 장비
      cardSelectIndex = target.equips.indexOf(selectCardType);
      chooseCard = userHandCards.find((card) => card.type === target.equips[cardSelectIndex]);
      targetCards = target.equips;
      break;
    case 2: // 무기
      chooseCard = userHandCards.find((card) => card.type === target.weapon);
      targetCards = target.weapon;
      break;
    case 3: // 디버프
      cardSelectIndex = target.debuffs.indexOf(selectCardType);
      chooseCard = userHandCards.find((card) => card.type === target.debuffs[cardSelectIndex]);
      targetCards = target.debuffs;
      break;
  }

  // 흡수: 상대의 카드를 나의 핸드 카드에 추가
  let isAbsorbing = false; // 흡수인지 신기루인지 판별
  if (
    game.getCharacter(user.id).stateInfo.state === config.character.characterStateType.ABSORBING &&
    game.getCharacter(targetId).stateInfo.state ===
      config.character.characterStateType.ABSORB_TARGET
  ) {
    isAbsorbing = true;
    if (chooseCard) {
      chooseCard.count++;
    } else {
      const plusCard = { type: selectCardType === 0 ? chooseHandCard : selectCardType, count: 1 };
      userHandCards.push(plusCard);
    }
  }

  //          흡수여부, 손패인지어디인지, 타겟, 선택한 카드가 있는 인덱스, 타겟이되는 카드있는곳, 인덱스
  game.mirage(isAbsorbing, selectType, targetId, selectCardType, targetCards, range);

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

  const responsePayload = {
    success: true,
    failCode: GLOBAL_FAIL_CODE.NONE_FAILCODE,
  };

  const cardSelectPayload = createResponse(
    PACKET_TYPE.CARD_SELECT_RESPONSE,
    user.socket.sequence,
    responsePayload,
  );

  user.socket.write(cardSelectPayload);
};
