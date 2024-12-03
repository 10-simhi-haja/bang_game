/** 프로토버프 파일을 읽어오기 위한 함수 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import protobuf from 'protobufjs';
import packetNames from '../protobufs/packetNames.js';
import CustomError from '../utils/errors/customError.js';
import ErrorCodes from '../utils/errors/errorCodes.js';

// 현재 파일의 절대 경로. 이 경로는 파일의 이름을 포함한 전체 경로
const __filename = fileURLToPath(import.meta.url);

// path.dirname() 함수는 파일 경로에서 디렉토리 경로만 추출 (파일 이름을 제외한 디렉토리의 전체 경로)
const __dirname = path.dirname(__filename);
const protoDir = path.join(__dirname, '../protobufs');

// 모든 프로토버프 파일을 읽는 함수
export const getAllProtoFiles = (dir, fileList = []) => {
  // 1. dir에 있는 모든 경로를 읽음.
  const files = fs.readdirSync(dir);

  // 2. 파일들을 순회
  files.forEach((file) => {
    // 3. 파일경로를 저장
    const filePath = path.join(dir, file);

    // 4. 파일이 폴더라면 재귀하여 안에 폴더를 한번 더 확인
    if (fs.statSync(filePath).isDirectory()) {
      getAllProtoFiles(filePath, fileList);
    }

    // 5. 일반 파일이라면 .proto 확장자만 찾아서 검색
    else if (path.extname(file) === '.proto') {
      // 6. 해당 파일을 fileList에 추가
      fileList.push(filePath);
    }
  });

  return fileList;
};

const protoFiles = getAllProtoFiles(protoDir);
//console.log(protoFiles);

const protoMessages = {};

export const loadProtos = async () => {
  try {
    const root = new protobuf.Root();

    await Promise.all(protoFiles.map((file) => root.load(file)));

    for (const [packageName, types] of Object.entries(packetNames)) {
      //console.log(packageName, types);
      protoMessages[packageName] = {};
      for (const [type, typeName] of Object.entries(types)) {
        protoMessages[packageName][type] = root.lookupType(typeName);
      }
    }

    console.log('Protobuf 파일 로드 완료');
  } catch (err) {
    throw new CustomError(ErrorCodes.PROTOBUF_ERROR, `Protobuf 파일 로드 중 오류 발생 : ${err}`);
  }
};

export const getProtoMessages = () => {
  return { ...protoMessages };
};
