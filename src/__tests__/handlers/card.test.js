import { jest } from '@jest/globals';
import useCardHandler from '../../handlers/card/useCard.handler.js';
import * as gameSession from '../../sessions/game.session.js';
import * as userSession from '../../sessions/user.session.js';
import config from '../../config/config.js';
import protobuf from 'protobufjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 프로토버프 로드
const root = protobuf.loadSync(path.resolve(__dirname, '../../protobufs/common/gamePacket.proto'));
const GamePacket = root.lookupType('packet.GamePacket');

// mock 함수 생성
const getUserBySocket = jest.fn();
const getGameSessionByUser = jest.fn();

// ES 모듈에 맞는 mock 방식 사용
jest.mock('../../sessions/user.session.js', () => ({
  getUserBySocket: jest.fn(),
}));

jest.mock('../../sessions/game.session.js', () => ({
  getGameSessionByUser: jest.fn(),
}));

const {
  card: { cardType: CARD_TYPE },
  character: { characterStateType: CHARACTER_STATE_TYPE },
} = config;

describe('카드 핸들러 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // mock 함수 재설정
    userSession.getUserBySocket.mockImplementation(getUserBySocket);
    gameSession.getGameSessionByUser.mockImplementation(getGameSessionByUser);
  });

  describe('카드 사용 핸들러', () => {
    const mockSocket = {
      write: jest.fn(),
      sequence: 1,
    };

    const mockUser = {
      id: 1,
      character: {
        handCards: [
          { type: CARD_TYPE.BBANG, count: 1 },
          { type: CARD_TYPE.SHIELD, count: 1 },
          { type: CARD_TYPE.DEATH_MATCH, count: 1 },
        ],
        stateInfo: {
          state: CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
        },
        bbangCount: 0,
      },
    };

    const mockTarget = {
      id: 2,
      character: {
        handCards: [],
        stateInfo: {
          state: CHARACTER_STATE_TYPE.NONE_CHARACTER_STATE,
        },
      },
    };

    const mockGame = {
      users: {
        1: mockUser,
        2: mockTarget,
      },
      getCharacter: jest.fn((id) => mockGame.users[id].character),
      removeCard: jest.fn(),
      getAllUserDatas: jest.fn(() => [mockUser, mockTarget]),
      getLiveUsersId: jest.fn(() => [1, 2]),
      setCharacterState: jest.fn(),
      plusHp: jest.fn(),
      plusAllUsersHp: jest.fn(),
      addWeapon: jest.fn(),
      addEquip: jest.fn(),
      addbuffs: jest.fn(),
      setBoomUpdateInterval: jest.fn(),
      useBbang: jest.fn(),
    };

    test('빵야 카드 사용 요청/응답 테스트', () => {
      getUserBySocket.mockReturnValue(mockUser);
      getGameSessionByUser.mockReturnValue(mockGame);

      // 요청 패킷 생성
      const requestPacket = {
        payload: {
          useCardRequest: {
            cardType: CARD_TYPE.BBANG,
            targetUserId: mockTarget.id,
          },
        },
      };

      const requestBuffer = GamePacket.encode(requestPacket).finish();
      const decodedRequest = GamePacket.decode(requestBuffer);

      useCardHandler({
        socket: mockSocket,
        payload: decodedRequest.payload.useCardRequest,
      });

      // 응답 패킷 검증
      expect(mockSocket.write).toHaveBeenCalled();
      const writeCall = mockSocket.write.mock.calls[0][0];
      expect(writeCall).toHaveProperty('payload.useCardResponse');
      expect(writeCall.payload.useCardResponse.success).toBe(true);

      expect(mockGame.removeCard).toHaveBeenCalledWith(mockUser.id, CARD_TYPE.BBANG);
    });

    test('쉴드 카드 사용 요청/응답 테스트', () => {
      getUserBySocket.mockReturnValue(mockUser);
      getGameSessionByUser.mockReturnValue(mockGame);

      // 요청 패킷 생성
      const requestPacket = {
        payload: {
          useCardRequest: {
            cardType: CARD_TYPE.SHIELD,
            targetUserId: mockUser.id, // 자신을 대상으로
          },
        },
      };

      const requestBuffer = GamePacket.encode(requestPacket).finish();
      const decodedRequest = GamePacket.decode(requestBuffer);

      useCardHandler({
        socket: mockSocket,
        payload: decodedRequest.payload.useCardRequest,
      });

      // 응답 패킷 검증
      expect(mockSocket.write).toHaveBeenCalled();
      const writeCall = mockSocket.write.mock.calls[0][0];
      expect(writeCall).toHaveProperty('payload.useCardResponse');
      expect(writeCall.payload.useCardResponse.success).toBe(true);

      expect(mockGame.setCharacterState).toHaveBeenCalledTimes(2);
      expect(mockGame.removeCard).toHaveBeenCalledWith(mockUser.id, CARD_TYPE.SHIELD);
    });

    test('현피 카드 사용 요청/응답 테스트', () => {
      getUserBySocket.mockReturnValue(mockUser);
      getGameSessionByUser.mockReturnValue(mockGame);

      // 요청 패킷 생성
      const requestPacket = {
        payload: {
          useCardRequest: {
            cardType: CARD_TYPE.DEATH_MATCH,
            targetUserId: mockTarget.id,
          },
        },
      };

      const requestBuffer = GamePacket.encode(requestPacket).finish();
      const decodedRequest = GamePacket.decode(requestBuffer);

      useCardHandler({
        socket: mockSocket,
        payload: decodedRequest.payload.useCardRequest,
      });

      // 응답 패킷 검증
      expect(mockSocket.write).toHaveBeenCalled();
      const writeCall = mockSocket.write.mock.calls[0][0];
      expect(writeCall).toHaveProperty('payload.useCardResponse');
      expect(writeCall.payload.useCardResponse.success).toBe(true);

      expect(mockGame.setCharacterState).toHaveBeenCalled();
      expect(mockGame.removeCard).toHaveBeenCalledWith(mockUser.id, CARD_TYPE.DEATH_MATCH);
    });

    test('잘못된 카드 타입 요청/응답 테스트', () => {
      getUserBySocket.mockReturnValue(mockUser);
      getGameSessionByUser.mockReturnValue(mockGame);

      // 요청 패킷 생성
      const requestPacket = {
        payload: {
          useCardRequest: {
            cardType: 9999, // 잘못된 카드 타입
            targetUserId: mockTarget.id,
          },
        },
      };

      const requestBuffer = GamePacket.encode(requestPacket).finish();
      const decodedRequest = GamePacket.decode(requestBuffer);

      useCardHandler({
        socket: mockSocket,
        payload: decodedRequest.payload.useCardRequest,
      });

      // 응답 패킷 검증
      expect(mockSocket.write).toHaveBeenCalled();
      const writeCall = mockSocket.write.mock.calls[0][0];
      expect(writeCall).toHaveProperty('payload.useCardResponse');
      expect(writeCall.payload.useCardResponse.success).toBe(false);

      expect(mockGame.removeCard).not.toHaveBeenCalled();
    });
  });
});
