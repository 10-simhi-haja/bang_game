'use strict';

// 카드 타입 열거형
const CARD_TYPES = {
  BBANG: 1,
  BIG_BBANG: 2,
  SHIELD: 3,
  VACCINE: 4,
  CALL_119: 5,
  DEATH_MATCH: 6,
  GUERRILLA: 7,
  ABSORB: 8,
  HALLUCINATION: 9,
  FLEA_MARKET: 10,
};

module.exports = {
  generateRandomUser: (userContext, events, done) => {
    const userId = Math.floor(Math.random() * 10000);
    const email = `test${userId}@test.com`;
    const nickname = `Player${userId}`;

    userContext.vars.userId = userId;
    userContext.vars.email = email;
    userContext.vars.nickname = nickname;
    userContext.vars.targetUserId = Math.floor(Math.random() * 10000);

    return done();
  },

  decideRoomAction: (userContext, events, done) => {
    userContext.vars.createRoom = Math.random() < 0.5;
    return done();
  },

  selectRoomAction: (userContext, events, done) => {
    const payload = userContext.vars.createRoom
      ? {
          createRoomRequest: {
            name: `Room by ${userContext.vars.nickname}`,
            maxUserNum: 8,
          },
        }
      : {
          joinRandomRoomRequest: {},
        };

    userContext.vars.roomPayload = payload;
    return done();
  },

  selectRandomCard: (userContext, events, done) => {
    const cardTypes = Object.values(CARD_TYPES);
    const randomIndex = Math.floor(Math.random() * cardTypes.length);
    userContext.vars.cardType = cardTypes[randomIndex];

    userContext.vars.targetUserId = Math.floor(Math.random() * 8) + 1;
    userContext.vars.randomPosition = Math.random();

    return done();
  },

  logResponse: (userContext, events, done) => {
    const response = events.response;
    console.log(`Response for ${userContext.vars.nickname}: ${JSON.stringify(response)}`);
    return done();
  },
};
