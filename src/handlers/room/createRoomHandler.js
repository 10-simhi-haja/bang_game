import handleError from '../../utils/errors/errorHandler.js';
import { v4 as uuidv4 } from 'uuid';

const createRoomHnadler = async ({ socket, payload }) => {
  try {
    const { name, maxUserNum } = payload;
    let roomData = {
      id: uuidv4(),
      ownerId: socket.account_id,
      name: name,
      maxUserNum: maxUserNum,
      state: 0, // WAIT 0, PREPARE 1, INAGAME 2
      users: [],
    };

    console.log('방을 만들거야: ', payload);

    const responseData = {

    };

    // 응답
    // {
    //     bool success = 1;
    //     RoomData room = 2;
    //     GlobalFailCode failCode = 3;
    // }
  } catch (error) {
    handleError(socket, error);
  }
};

export default createRoomHnadler;

// 요청
// {
//     string name = 1;
//     int32 maxUserNum = 2;
// }
