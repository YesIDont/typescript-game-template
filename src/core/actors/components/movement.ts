import { TVector, Vector } from '../../vector';

export type TAMovement = {
  speed: number;
  speedMax: number;
  direction: TVector;
};

export function movement(speedMax = 0, direction: TVector = Vector.new()): TAMovement {
  return {
    speed: 0,
    speedMax,
    direction,
  };
}
