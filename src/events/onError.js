export const onError = (socket) => async (error) => {
  console.error(`소켓 오류: ${error}`);
};

export default onError;
