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
  CHARACTER_SPOWN_POINT,
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
    characterSpownPoint: CHARACTER_SPOWN_POINT,
  },
  role: {
    roleType: ROLE_TYPE,
    rolesDistribution: ROLES_DISTRIBUTION,
  },
  roomStateType: {
    wait: ROOM_STATE_TYPE.WAIT,
    propare: ROOM_STATE_TYPE.PREPARE,
    inGame: ROOM_STATE_TYPE.INGAME,
  },
  databases: {
    USER_DB: {
      name: DB_NAME,
      user: DB_USER,
      password: DB_PASSWORD,
      host: DB_HOST,
      port: DB_PORT,
    },
  },
  jwt: {
    key: JWT_SECRET_KEY,
  },
};

export default config;
