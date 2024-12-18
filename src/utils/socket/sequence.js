// 소켓의 패킷 시퀀스를 위한 파일

// 소켓 패킷 시퀀스 검증 함수
const validateSequence = (socket, receiveSequence) => {
  const expectedSequence = socket.sequence + 1;

  // 정상작동 시퀀스
  if (receiveSequence === expectedSequence) {
    socket.sequence = receiveSequence;
    return { status: 'success', message: '정상 시퀀스' };
  }

  // 중복된 패킷
  if (receiveSequence < expectedSequence) {
    return { status: 'duplicate', message: `중복된 패킷: ${receiveSequence}` };
  }

  // 누락된 패킷
  if (receiveSequence > expectedSequence) {
    return {
      status: 'missing',
      message: `누락된 패킷: 예상 ${expectedSequence}, 받은패킷 ${receiveSequence}`,
    };
  }
};

export default validateSequence;
