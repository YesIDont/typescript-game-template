import { mapRange, sin } from './math';

/*
  Speed: number of rounds made within one second.
  1 = from 0 to 1 and back within one second.
*/
export const pulseValue = (speed = 1, min = 0, max = 1): number =>
  mapRange(sin((performance.now() / 280) * speed), -1, 1, min, max);
