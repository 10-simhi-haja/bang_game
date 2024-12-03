'use strict';

const ProtocolHandler = require('./protocolHandler.cjs');

// 카드 타입 열거형
const CARD_TYPES = {
  NONE: 0,
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
  MATURED_SAVINGS: 11,
  WIN_LOTTERY: 12,
  SNIPER_GUN: 13,
  HAND_GUN: 14,
  DESERT_EAGLE: 15,
  AUTO_RIFLE: 16,
  LASER_POINTER: 17,
  RADAR: 18,
  AUTO_SHIELD: 19,
  STEALTH_SUIT: 20,
  CONTAINMENT_UNIT: 21,
  SATELLITE_TARGET: 22,
  BOMB: 23,
};

// Packet types from server's PACKET_TYPE
const PAYLOAD_TYPES = {
  LOGIN_REQUEST: 3,
  CREATE_ROOM_REQUEST: 5,
  JOIN_RANDOM_ROOM_REQUEST: 11,
  GAME_PREPARE_REQUEST: 17,
  GAME_START_REQUEST: 20,
  USE_CARD_REQUEST: 25,
  POSITION_UPDATE_REQUEST: 23,
};

module.exports = {
  generateRandomUser: (userContext, events, done) => {
    const userId = Math.floor(Math.random() * 1000000);
    const email = `test${userId}@test.com`;
    const nickname = `Player${userId}`;

    userContext.vars.userId = userId;
    userContext.vars.email = email;
    userContext.vars.password = 'test1234';
    userContext.vars.nickname = nickname;

    return done();
  },

  createLoginPacket: (userContext, events, done) => {
    const payload = {
      loginRequest: {
        email: userContext.vars.email,
        password: userContext.vars.password,
      },
    };
    userContext.vars.binaryPacket = ProtocolHandler.createPacket(
      PAYLOAD_TYPES.LOGIN_REQUEST,
      payload,
    );
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

  createRoomPacket: (userContext, events, done) => {
    const payloadType = userContext.vars.createRoom
      ? PAYLOAD_TYPES.CREATE_ROOM_REQUEST
      : PAYLOAD_TYPES.JOIN_RANDOM_ROOM_REQUEST;
    userContext.vars.binaryPacket = ProtocolHandler.createPacket(
      payloadType,
      userContext.vars.roomPayload,
    );
    return done();
  },

  createGamePreparePacket: (userContext, events, done) => {
    const payload = {
      gamePrepareRequest: {},
    };
    userContext.vars.binaryPacket = ProtocolHandler.createPacket(
      PAYLOAD_TYPES.GAME_PREPARE_REQUEST,
      payload,
    );
    return done();
  },

  createGameStartPacket: (userContext, events, done) => {
    const payload = {
      gameStartRequest: {},
    };
    userContext.vars.binaryPacket = ProtocolHandler.createPacket(
      PAYLOAD_TYPES.GAME_START_REQUEST,
      payload,
    );
    return done();
  },

  selectRandomCard: (userContext, events, done) => {
    const cardTypes = Object.values(CARD_TYPES).filter((type) => type !== CARD_TYPES.NONE);
    const randomIndex = Math.floor(Math.random() * cardTypes.length);
    userContext.vars.cardType = cardTypes[randomIndex];

    const targetNeededCards = [
      CARD_TYPES.BBANG,
      CARD_TYPES.BIG_BBANG,
      CARD_TYPES.DEATH_MATCH,
      CARD_TYPES.GUERRILLA,
      CARD_TYPES.ABSORB,
      CARD_TYPES.HALLUCINATION,
      CARD_TYPES.CONTAINMENT_UNIT,
    ];

    userContext.vars.targetUserId = targetNeededCards.includes(cardTypes[randomIndex])
      ? Math.floor(Math.random() * 8) + 1
      : 0;

    userContext.vars.randomPosition = Math.random();

    return done();
  },

  createUseCardPacket: (userContext, events, done) => {
    const payload = {
      useCardRequest: {
        cardType: userContext.vars.cardType,
        targetUserId: userContext.vars.targetUserId,
      },
    };
    userContext.vars.binaryPacket = ProtocolHandler.createPacket(
      PAYLOAD_TYPES.USE_CARD_REQUEST,
      payload,
    );
    return done();
  },

  createPositionUpdatePacket: (userContext, events, done) => {
    const payload = {
      positionUpdateRequest: {
        x: userContext.vars.randomPosition,
        y: userContext.vars.randomPosition,
      },
    };
    userContext.vars.binaryPacket = ProtocolHandler.createPacket(
      PAYLOAD_TYPES.POSITION_UPDATE_REQUEST,
      payload,
    );
    return done();
  },

  logResponse: (userContext, events, done) => {
    const response = events.response;
    console.log(`Response for ${userContext.vars.nickname}: ${JSON.stringify(response)}`);
    return done();
  },
};
