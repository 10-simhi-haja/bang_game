import config from '../../config/config.js';
import { createResponse } from '../packet/response/createResponse.js';

const warningNotification = (game) => {
  const users = game.getAllUsers();

  const responseData = {
    warningType: config.warningType.BOMB_WARNING,
    expectedAt: Date.now() + 10 * 1000,
  };

  users.forEach((notiUser) => {
    const warningNotification = createResponse(
      config.packet.packetType.WARNING_NOTIFICATION,
      notiUser.socket.sequence,
      responseData,
    );

    notiUser.socket.write(warningNotification);
  });

  game.intervalManager.removeGameIntervalByType(game.id, config.intervalType.BOMB);
};

export default warningNotification;
