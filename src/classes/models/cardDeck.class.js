import config from '../../config/config.js';
import { shuffle } from '../../utils/util/shuffle.js';

const {
  card: { cardType: CARD_TYPE, cardPool: CARD_POOL },
} = config;

const CARD_TYPE_NAME_MAP = Object.fromEntries(
  Object.entries(CARD_TYPE).map(([key, value]) => [value, key]),
);

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
    if (this.deck.length === 0 && this.useCards.length !== 0) {
      this.useCardToDeck();
    }

    if (this.deck.length === 0) {
      return null;
    }
    const card = this.deck.pop();
    console.log(this.deck);
    return { type: card.type, count: 1 };
  }

  // 여러장뽑기 리턴값은 배열
  drawMultipleCards(count) {
    const cards = [];
    for (let i = 0; i < count; i++) {
      const card = this.drawCard();
      if (card === null) {
        return cards;
      }
      cards.push(card);
    }
    return cards;
  }

  addUseCard(cardType) {
    this.useCards.push(cardType);
  }

  useCardToDeck() {
    // 사용한 카드로 덱 재생성
    this.deck = shuffle(
      this.useCards.reduce((deck, type) => {
        const name = CARD_TYPE_NAME_MAP[type];
        if (name) {
          deck.push({ type, name });
        }
        return deck;
      }, []),
    );

    this.useCards = [];
  }
}

export default CardDeck;
