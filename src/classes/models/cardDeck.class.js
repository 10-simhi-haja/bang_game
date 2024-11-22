import config from '../../config/config.js';
import { shuffle } from '../../utils/util/shuffle.js';

const {
  card: { cardType: CARD_TYPE, cardPool: CARD_POOL },
} = config;

class CardDeck {
  // 다수의 유저 데이터를 담아야하기 때문에 배열로 저장
  constructor() {
    this.deck = Object.entries(CARD_TYPE).reduce((deck, [key, value]) => {
      if (key === 'NONE') return deck;

      const cardCount = this.getCardCount(value);
      for (let i = 0; i < cardCount; i++) {
        deck.push({ type: value, name: key });
      }
      return deck;
    }, []);

    this.deck = shuffle(this.deck);
    console.log(this.deck);
    this.useCards = [];
  }

  // 카드 수량 확인
  getCardCount(cardType) {
    return CARD_POOL[cardType] || 0;
  }

  // 1장뽑기
  drawCard() {
    if (this.deck.length === 0) {
      // 뽑을 카드 없음. 사용한 카드 목록을 섞어서 덱으로 다시 두는 코드 필요.
    }
    const card = this.deck.pop();
    return { type: card, count: 1 };
  }

  addUseCard(cardType) {
    this.useCards.push({});
  }
}

export default CardDeck;
