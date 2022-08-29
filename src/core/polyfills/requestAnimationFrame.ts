import { max } from '../utils/math';

type AnimationCallback = (timeDelta: number) => void;

export function setRequestAnimationFrame(): void {
  let lastTime = 0;
  const vendors = ['ms', 'moz', 'webkit', 'o'];
  for (let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame =
      window[vendors[x] + 'CancelAnimationFrame'] ||
      window[vendors[x] + 'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame)
    window.requestAnimationFrame = (callback: AnimationCallback): number => {
      const currTime = Date.now();
      const timeToCall = max(0, 16 - (currTime - lastTime));
      const id = window.setTimeout(() => {
        callback(currTime + timeToCall);
      }, timeToCall);
      lastTime = currTime + timeToCall;

      return id;
    };

  if (!window.cancelAnimationFrame)
    window.cancelAnimationFrame = function (id): void {
      clearTimeout(id);
    };
}
