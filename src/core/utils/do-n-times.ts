export const doNTimes = (callback: (index: number) => void, n = 2): void => {
  let i = 0;
  for (i; i < n; i++) {
    callback(i);
  }
};
