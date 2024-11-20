import config from '../../config/config.js';
import { createResponse } from '../packet/response/createResponse.js';

const useCardNotification = (socket, userId) => {
  const userCardPayload = createResponse(
    config.packet.packetType.USE_CARD_NOTIFICATION,
    socket.sequence,
    userId,
  );

  Object.entries(room.users).forEach(([key, userData]) => {
    if (key !== userId.toString()) {
      const userSocket = userData.user.socket;
      if (userSocket) {
        userSocket.write(userCardPayload);
      }
    }
  });
};

export default useCardNotification;
