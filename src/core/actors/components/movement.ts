import { TVector, Vector } from '../../vector';

export type Movement = {
  speed: number;
  speedMax: number;
  direction: TVector;
};

export function movement(speedMax = 0, direction: TVector = Vector.new()): Movement {
  return {
    speed: 0,
    speedMax,
    direction,
  };
}
