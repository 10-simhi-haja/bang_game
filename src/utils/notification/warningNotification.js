import config from '../../config/config.js';
import { createResponse } from '../packet/response/createResponse.js';
import animationNotification from './animationNotification.js';

const warningNotification = (game, targetUser) => {
  const users = game.getAllUsers();

  const responseData = {
    warningType: config.warningType.BOMB_WARNING,
    expectedAt: Date.now() + 10 * 1000,
  };

  console.log('터지나????');
  // 경고 보내주는 알림
  users.forEach((notiUser) => {
    const warningNotification = createResponse(
      config.packet.packetType.WARNING_NOTIFICATION,
      notiUser.socket.sequence,
      responseData,
    );

    notiUser.socket.write(warningNotification);
  });

  game.intervalManager.removeGameIntervalByType(game.id, config.intervalType.BOMB);

  // 폭발 터지는 애니 & 실제 HP 닳기...
  game.intervalManager.addGameInterval(
    game.id,
    () => animationNotification(game, config.animationType.BOMB_ANIMATION, targetUser),
    config.interval.BOMB_ANIMATION,
    config.intervalType.BOMB_ANIMATION,
  );
};

export default warningNotification;
