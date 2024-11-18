import createHeader from '../../../../../new_project_net/src/utils/createHeader.js';
import { getProtoMessages } from '../../../../../new_project_net/src/init/loadProtos.js';
import { PayloadName } from '../../../../../new_project_net/src/constants/packetTypes.js';

const makeNotification = (message, packetType, sequence) => {
  const header = createHeader(message.length, packetType, sequence);

  return Buffer.concat([header, message]);
};

// 클래스 함수를 만들어가지고 호출해서 보내기
export const createNotificationPacket = (payload, packetType, sequence) => {
  const protoMessages = getProtoMessages();
  const notification = protoMessages.gamePacket.GamePacket;

  const payloadName = PayloadName[packetType];
  const notificationPacket = notification.encode({ [payloadName]: payload }).finish();

  return makeNotification(notificationPacket, packetType, sequence);
};
