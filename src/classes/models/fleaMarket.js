import config from '../../config/config.js';
import { getGameSessionByUser } from '../../sessions/game.session.js';

const {
  card: { cardType: CARD_TYPE, cardPool: CARD_POOL },
} = config;

class FleaMarket {
  // 다수의 유저 데이터를 담아야하기 때문에 배열로 저장
  constructor(game) {
    this.cards = [];
    this.indexs = [];
    this.gameId = game.id;
  }

  async initialize(game) {
    const liveUsers = game.getLiveUsers();
    const drawCards = await game.cardDeck.drawMultipleCards(liveUsers.length);
    console.log(`drawCards: ${drawCards}`);
    for (let i = 0; i < liveUsers.length; i++) {
      this.cards.push(drawCards[i].type);
    }
  }

  // 해당 유저에게 플리마켓에있는 카드의 인덱스를 선택
  pickCard(user, pickIndex) {
    const game = getGameSessionByUser(user);
    const character = game.getCharacter(user.id);
    const card = {
      type: this.cards[pickIndex],
      count: 1,
    };
    this.cards.splice(pickIndex, 1);

    character.handCards.push(card);
  }

  // 해당 유저에게 플리마켓에있는 카드의 인덱스를 랜덤 선택
  randomPickCard(user) {
    if (this.cards.length === 0) {
      console.log('플리마켓 매진');
    }
    const pickIndex = Math.floor(Math.random() * this.cards.length);

    this.pickCard(user, pickIndex);
  }
}

export default FleaMarket;
