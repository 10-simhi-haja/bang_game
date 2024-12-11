/** 중앙 집중식 관리 파일
 *
 * 사용 이유: 만약에 process.env.~~ 가 어느곳에서 사용중이라고 했을 때
 * 한 군데가 아니라 여러 곳일 경우 전부다 바꿔야 하지만 현재 파일에서 바꾸면 다 바꾸어지기 때문에 유지보수면에서 편리함
 *
 * 사용 파일:
 * 1. env.js
 * 2. header.js
 */

import {
  PORT,
  HOST,
  CLIENT_VERSION,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
  JWT_SECRET_KEY,
  DB_NAME2,
  DB_USER2,
  DB_PASSWORD2,
  DB_HOST2,
  DB_PORT2,
  REDIS_PASSWORD,
  REDIS_HOST,
  REDIS_PORT,
  REDIS_NAME,
  REDIS_USER,
} from '../constants/env.js';
import {
  TOTAL_HEADER_LENGTH,
  PAYLOAD_ONEOF_CASE_LENGTH,
  VERSION_LENGTH,
  SEQUENCE_LENGTH,
  PAYLOAD_LENGTH,
  PACKET_TYPE,
  CHARACTER_TYPE,
  ROLE_TYPE,
  ROLES_DISTRIBUTION,
  CHARACTER_STATE_TYPE,
  ROOM_STATE_TYPE,
  CHARACTER_SPAWN_POINT,
  CARD_TYPE,
  GLOBAL_FAIL_CODE,
  INTERVAL,
  INTERVAL_TYPE,
  PHASE_TYPE,
  WIN_TYPE,
  CARD_POOL,
  WARNING_TYPE,
  ANIMATION_TYPE,
  PROBABILITY,
} from '../constants/header.js';

const config = {
  server: {
    port: PORT,
    host: HOST,
  },
  client: {
    version: CLIENT_VERSION,
  },
  packet: {
    totalHeaderLength: TOTAL_HEADER_LENGTH,
    payloadOneofCaseLength: PAYLOAD_ONEOF_CASE_LENGTH,
    versionLength: VERSION_LENGTH,
    sequenceLength: SEQUENCE_LENGTH,
    payloadLength: PAYLOAD_LENGTH,
    packetType: PACKET_TYPE,
  },
  character: {
    characterType: CHARACTER_TYPE,
    characterStateType: CHARACTER_STATE_TYPE,
    characterSpawnPoint: CHARACTER_SPAWN_POINT,
  },
  card: {
    cardType: CARD_TYPE,
    cardPool: CARD_POOL,
  },
  role: {
    roleType: ROLE_TYPE,
    rolesDistribution: ROLES_DISTRIBUTION,
  },
  roomStateType: {
    wait: ROOM_STATE_TYPE.WAIT,
    prepare: ROOM_STATE_TYPE.PREPARE,
    inGame: ROOM_STATE_TYPE.INGAME,
  },
  globalFailCode: {
    globalFailCode: GLOBAL_FAIL_CODE,
  },
  databases: {
    UESR_DB: {
      database: DB_NAME,
      user: DB_USER,
      password: DB_PASSWORD,
      host: DB_HOST,
      port: DB_PORT,
    },
    GAME_DB: {
      database: DB_NAME2,
      user: DB_USER2,
      password: DB_PASSWORD2,
      host: DB_HOST2,
      port: DB_PORT2,
    },
    REDIS_DB: {
      database: REDIS_NAME,
      user: REDIS_USER,
      password: REDIS_PASSWORD,
      host: REDIS_HOST,
      port: REDIS_PORT,
    },
  },
  jwt: {
    key: JWT_SECRET_KEY,
  },
  interval: INTERVAL,
  intervalType: INTERVAL_TYPE,
  phaseType: PHASE_TYPE,
  winType: WIN_TYPE,
  warningType: WARNING_TYPE,
  animationType: ANIMATION_TYPE,
  probability: PROBABILITY,
};

export default config;
