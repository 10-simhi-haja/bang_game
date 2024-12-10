import config from '../../config/config.js';
import { shuffle } from '../../utils/util/shuffle.js';
import redis from '../../database/redis/redis.js';

const {
  card: { cardType: CARD_TYPE, cardPool: CARD_POOL },
} = config;

const CARD_TYPE_NAME_MAP = Object.fromEntries(
  Object.entries(CARD_TYPE).map(([key, value]) => [value, key]),
);

async function testRedisConnection() {
  try {
    await redis.set('testKey', 'Hello, Redis Cloud!');
    const value = await redis.get('testKey');
    console.log('Retrieved value:', value); // 출력: Hello, Redis Cloud!
  } catch (err) {
    console.error('Redis test error:', err);
  }
}

testRedisConnection();
class CardDeck {
  // 다수의 유저 데이터를 담아야하기 때문에 배열로 저장
  constructor(gameId) {
    this.gameId = gameId;
    this.useCardsKey = `usedCards:${gameId}`;
    this.deckKey = `deck:${gameId}`;
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
    console.log(`initializeDeck실행 shuffleDeck: ${shuffledDeck}`);
    await redis.set(this.deckKey, JSON.stringify(shuffledDeck));
    await redis.del(this.useCardsKey);
  }

  // 카드 수량 확인
  getCardCount(cardType) {
    return CARD_POOL[cardType] || 0;
  }

  // 1장뽑기
  async drawCard() {
    const deckData = await redis.get(this.deckKey);
    if (!deckData) {
      throw new Error('Deck not initialized');
    }

    const deck = JSON.parse(deckData);
    if (deck.length === 0) {
      await this.useCardToDeck(); // 사용된 카드로 덱 재생성
      return this.drawCard(); // 재귀 호출로 다시 카드 뽑기
    }

    const card = deck.pop();
    await redis.set(this.deckKey, JSON.stringify(deck));
    return { type: card.type, count: 1 };
  }

  // 여러장뽑기 리턴값은 배열
  async drawMultipleCards(count) {
    const deckData = await redis.get(this.deckKey);
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
    await redis.set(this.deckKey, JSON.stringify(deck));
    return cards.map((card) => ({ type: card.type, count: 1 }));
  }

  async addUseCard(cardType) {
    // this.useCards.push(cardType);
    const usedCards = JSON.parse((await redis.get(this.useCardsKey)) || '[]');
    usedCards.push(cardType);
    await redis.set(this.useCardsKey, JSON.stringify(usedCards));
  }

  async useCardToDeck() {
    // 사용한 카드로 덱 재생성
    const usedCardsData = await redis.get(this.useCardsKey);
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

    await redis.set(this.deckKey, JSON.stringify(newDeck));
    await redis.del(this.useCardsKey);
  }

  async clearDeck() {
    // 게임 종료 시 Redis 데이터 삭제
    await redis.del(this.deckKey);
    await redis.del(this.useCardsKey);
  }
}

export default CardDeck;
