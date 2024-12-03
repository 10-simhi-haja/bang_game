// 소켓의 패킷 시퀀스를 위한 파일

// 소켓 패킷 시퀀스 검증 함수
const validateSequence = (socket, reciveSequence) => {
  const expectedSequence = socket.sequence + 1;
  if (expectedSequence === reciveSequence) {
    socket.sequence = reciveSequence;
    return true;
  }

  // 패킷이 중복되었는지 검증
  else if (reciveSequence < expectedSequence) {
    return false;
  }

  // 패킷이 누락되었는지 검증
  else {
    return false;
  }
};

export default validateSequence;
