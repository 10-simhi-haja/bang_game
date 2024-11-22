// 배열을 중복없이 섞은다음 리턴
// 배열과 숫자 => 배열
// 유틸로 뺄까?
export const shuffle = (array) => {
  // 셔플 가능한지 확인
  if (array === undefined || array === null || array.length <= 1) {
    throw new Error(`섞을수 없는 배열입니다.`);
  }

  const newArray = [...array];

  // 역할 섞기
  for (let i = newArray.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[randomIndex]] = [newArray[randomIndex], newArray[i]];
  }

  return newArray;
};
