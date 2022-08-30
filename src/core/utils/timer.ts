import { mapRangeClamped } from './math';

export type TTimer = {
  update(dt: number): boolean;
  getAlpha(): number;
  reset(): void;
};

export function newTimer(from = 1, to = 0): TTimer {
  let nextUpdateIn = to ? Math.random() * (to - from) + from : from;
  let counter = 0;

  const timer: TTimer = {
    update: (deltaTime: number): boolean => {
      counter += deltaTime;
      if (counter >= nextUpdateIn) {
        counter = 0;

        return true;
      }

      return false;
    },
    getAlpha: (): number => mapRangeClamped(counter, 0, nextUpdateIn),
    reset: (): void => {
      counter = 0;
    },
  };

  if (to != undefined) {
    timer.update = (deltaTime: number): boolean => {
      counter += deltaTime;
      if (counter >= nextUpdateIn) {
        counter = 0;

        nextUpdateIn = Math.random() * (to - from) + from;

        return true;
      }

      return false;
    };
  }

  return timer;
}
