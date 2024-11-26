import config from '../../config/config.js';
import { createResponse } from '../packet/response/createResponse.js';
import animationNotification from './animationNotification.js';

const warningNotification = (game) => {
  const users = game.getAllUsers();
  const bombAnimation = 2;

  const responseData = {
    warningType: config.warningType.BOMB_WARNING,
    expectedAt: Date.now() + 10 * 1000,
  };

  console.log('터지나????');
  users.forEach((notiUser) => {
    const warningNotification = createResponse(
      config.packet.packetType.WARNING_NOTIFICATION,
      notiUser.socket.sequence,
      responseData,
    );

    notiUser.socket.write(warningNotification);
  });

  game.intervalManager.removeGameIntervalByType(game.id, config.intervalType.BOMB);
  game.intervalManager.addGameInterval(
    game.id,
    () => animationNotification(game, bombAnimation),
    5 * 1000,
    10,
  );
};

export default warningNotification;
