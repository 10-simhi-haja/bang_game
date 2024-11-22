import BaseManager from './base.manager.js';

class IntervalManager extends BaseManager {
  constructor() {
    super();
    this.intervals = new Map();
    this.gameIntervals = new Map();
  }

  // 있으면 덮어쓰고 없으면 추가
  addInterval(playerId, callback, interval, type) {
    if (!this.intervals.has(playerId)) {
      this.intervals.set(playerId, new Map());
    }
    this.intervals.get(playerId).set(type, setInterval(callback, interval));
  }

  // playerId에 해당하는 type무관 전부
  removeInterval(playerId) {
    if (this.intervals.has(playerId)) {
      const userIntervals = this.intervals.get(playerId);
      userIntervals.forEach((intervalId) => clearInterval(intervalId));
      this.intervals.delete(playerId);
    }
  }

  // playerId 와 type이 일치하는 것만
  removeIntervalByType(playerId, type) {
    if (this.intervals.has(playerId)) {
      const userIntervals = this.intervals.get(playerId);
      if (userIntervals.has(type)) {
        clearInterval(userIntervals.get(type));
        userIntervals.delete(type);
      }
    }
  }

  //////// game Interval

  // 있으면 덮어쓰고 없으면 추가
  addGameInterval(gameId, callback, interval, type) {
    if (!this.gameIntervals.has(gameId)) {
      this.gameIntervals.set(gameId, new Map());
    }
    const gameIntervals = this.gameIntervals.get(gameId);

    // 동일 type의 기존 Interval 제거
    if (gameIntervals.has(type)) {
      clearInterval(gameIntervals.get(type));
    }

    // 새로운 Interval 추가
    gameIntervals.set(type, setInterval(callback, interval));
  }

  // gameId에 해당하는 type무관 전부
  removeGameInterval(gameId) {
    if (this.gameIntervals.has(gameId)) {
      const userIntervals = this.gameIntervals.get(gameId);
      userIntervals.forEach((intervalId) => clearInterval(intervalId));
      this.gameIntervals.delete(gameId);
    }
  }

  // gameId 와 type이 일치하는 것만
  removeGameIntervalByType(gameId, type) {
    if (this.gameIntervals.has(gameId)) {
      const userIntervals = this.gameIntervals.get(gameId);
      if (userIntervals.has(type)) {
        clearInterval(userIntervals.get(type));
        userIntervals.delete(type);
      }
    }
  }

  clearAll() {
    this.intervals.forEach((userIntervals) => {
      userIntervals.forEach((intervalId) => clearInterval(intervalId));
    });
    this.intervals.clear();
    this.gameIntervals.clear();
  }
}

export default IntervalManager;
