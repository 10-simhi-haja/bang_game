import handleError from '../../utils/errors/errorHandler.js';
import { v4 as uuidv4 } from 'uuid';
import { createResponse } from '../../utils/packet/response/createResponse.js';
import config from '../../config/config.js';
import { addGameSession } from '../../sessions/game.session.js';
import { getUserBySocket } from '../../sessions/user.session.js';

const joinRoomHandler = async ({ socket, payload }) => {
  try {
   
  } catch (error) {
    handleError(socket, error);
  }
};

export default joinRoomHandler;
