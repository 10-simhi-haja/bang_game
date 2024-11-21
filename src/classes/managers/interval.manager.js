import BaseManager from './base.manager.js';

class IntervalManager extends BaseManager {
  constructor() {
    super();
    this.intervals = new Map();
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
  removeInterval(playerId, type) {
    if (this.intervals.has(playerId)) {
      const userIntervals = this.intervals.get(playerId);
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
  }
}

export default IntervalManager;
