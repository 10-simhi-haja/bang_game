import config from '../../config/config.js';

const {
  card: { cardType: CARD_TYPE, cardPool: CARD_POOL },
} = config;

class FleaMarket {
  // 다수의 유저 데이터를 담아야하기 때문에 배열로 저장
  constructor(game, count) {
    this.cards = [];
    this.indexs = [];

    const drawCards = game.cardDeck.drawMultipleCards(count);
    for (let i = 0; i < count; i++) {
      this.cards.push(drawCards[i].type);
      this.indexs.push(i);
    }
  }
}

export default FleaMarket;