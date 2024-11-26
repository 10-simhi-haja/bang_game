import config from '../../config/config.js';
import { createResponse } from '../packet/response/createResponse.js';

const animationNotification = (game, animationType) => {
  const users = game.getAllUsers();

  const responseDate = {
    userId: 1,
    animationType: animationType,
  };

  console.log('이것은 애니메이션이다!');

  users.forEach((notiUser) => {
    const animationNotification = createResponse(
      config.packet.packetType.ANIMATION_NOTIFICATION,
      notiUser.socket.sequence,
      responseDate,
    );

    notiUser.socket.write(animationNotification);
  });
};

export default animationNotification;
