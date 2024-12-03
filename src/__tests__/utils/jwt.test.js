import { createJWT } from '../../utils/jwt/createToken.js';
import { decodeToken } from '../../utils/jwt/decodeToken.js';

// describe은 테스트들을 논리적인 그룹으로 묶는 역할을 함
// 비슷한 역할들끼리 묶는 함수라고 생각하면 된다
describe('JWT 유틸리티 테스트', () => {
  const testUser = {
    email: 'test@example.com',
  };

  test('토큰 생성 테스트', () => {
    const token = createJWT(testUser.email);
    // expect는 어떤 테스트를 할지에 대한 로직
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  test('토큰 디코딩 테스트', () => {
    const token = createJWT(testUser.email);
    const decoded = decodeToken(token);
    expect(decoded).toBeDefined();
    expect(decoded.email).toBe(testUser.email);
  });

  test('잘못된 토큰 디코딩 시 에러 발생', () => {
    expect(() => {
      decodeToken('invalid.token.here');
    }).toThrow();
  });
});
