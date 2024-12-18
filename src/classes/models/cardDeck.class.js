import config from '../../config/config.js';
import { shuffle } from '../../utils/util/shuffle.js';
import redisManager from '../managers/redis.manager.js';

const {
  card: { cardType: CARD_TYPE, cardPool: CARD_POOL },
} = config;

const CARD_TYPE_NAME_MAP = Object.fromEntries(
  Object.entries(CARD_TYPE).map(([key, value]) => [value, key]),
);

class CardDeck {
  // 다수의 유저 데이터를 담아야하기 때문에 배열로 저장
  constructor(gameId) {
    this.gameId = gameId;
    this.useCardsKey = `GAME${gameId}:USECARDS`;
    this.deckKey = `GAME${gameId}:DECK`;
  }

  async initializeDeck() {
    const deck = Object.entries(CARD_TYPE).reduce((deck, [key, value]) => {
      if (key === 'NONE') return deck;

      const cardCount = this.getCardCount(value);
      for (let i = 0; i < cardCount; i++) {
        deck.push({ type: value, name: key });
      }
      return deck;
    }, []);

    const shuffledDeck = shuffle(deck);
    await redisManager.getClient().set(this.deckKey, JSON.stringify(shuffledDeck));
    await redisManager.getClient().del(this.useCardsKey);
  }

  // 카드 수량 확인
  getCardCount(cardType) {
    return CARD_POOL[cardType] || 0;
  }

  // 1장뽑기
  async drawCard() {
    const deckData = await redisManager.getClient().get(this.deckKey);
    if (!deckData) {
      throw new Error('Deck not initialized');
    }

    const deck = JSON.parse(deckData);
    if (deck.length === 0) {
      await this.useCardToDeck(); // 사용된 카드로 덱 재생성
      return this.drawCard(); // 재귀 호출로 다시 카드 뽑기
    }

    const card = deck.pop();
    await redisManager.getClient().set(this.deckKey, JSON.stringify(deck));
    return { type: card.type, count: 1 };
  }

  // 여러장뽑기 리턴값은 배열
  async drawMultipleCards(count) {
    const deckData = await redisManager.getClient().get(this.deckKey);
    if (!deckData) {
      throw new Error('Deck not initialized');
    }

    const deck = JSON.parse(deckData);
    if (deck.length < count) {
      // 덱이 부족할 경우 남은 카드만 뽑고 재생성 후 추가로 뽑음
      const remainingCards = deck.splice(-deck.length);
      await this.useCardToDeck();
      const additionalCards = await this.drawMultipleCards(count - remainingCards.length);
      console.log('remainingCards:', remainingCards);
      console.log('additionalCards:', additionalCards);
      return [...remainingCards, ...additionalCards];
    }

    const cards = deck.splice(-count, count);
    await redisManager.getClient().set(this.deckKey, JSON.stringify(deck));
    return cards.map((card) => ({ type: card.type, count: 1 }));
  }

  async addUseCard(cardType) {
    console.log('addUseCard실행');
    // this.useCards.push(cardType);
    const usedCards = JSON.parse((await redisManager.getClient().get(this.useCardsKey)) || '[]');
    usedCards.push(cardType);
    await redisManager.getClient().set(this.useCardsKey, JSON.stringify(usedCards));
  }

  async useCardToDeck() {
    // 사용한 카드로 덱 재생성
    const usedCardsData = await redisManager.getClient().get(this.useCardsKey);
    if (!usedCardsData) return;

    const usedCards = JSON.parse(usedCardsData);
    const newDeck = shuffle(
      usedCards.reduce((deck, type) => {
        const name = CARD_TYPE_NAME_MAP[type];
        if (name) {
          deck.push({ type, name });
        }
        return deck;
      }, []),
    );

    await redisManager.getClient().set(this.deckKey, JSON.stringify(newDeck));
    await redisManager.getClient().del(this.useCardsKey);
  }

  async clearDeck() {
    // 게임 종료 시 Redis 데이터 삭제
    await redisManager.getClient().del(this.deckKey);
    await redisManager.getClient().del(this.useCardsKey);
  }
}

export default CardDeck;
