import { TActor } from '../actors/actor-types';
import { TShape } from './proxyTypes';
import { TCollisionResult } from './types';

export const ECollisionResponses = {
  slideOff: 0,
};

export type TCollisionResponseName = keyof typeof ECollisionResponses;
export type TCollisionResponse = (
  now: number,
  deltaSeconds: number,
  body: TShape,
  otherBody: TShape,
  otherActor: TActor,
  result: TCollisionResult,
) => void;

export function slideOff(
  now: number,
  deltaSeconds: number,
  body: TShape,
  otherBody: TShape,
  otherActor: TActor,
  result: TCollisionResult,
): void {
  const [overlap, overlapX, overlapY] = result;
  body.x -= overlap * overlapX;
  body.y -= overlap * overlapY;
}

export function switchCollisionResponse(type: TCollisionResponseName): TCollisionResponse {
  /* eslint-disable indent */
  switch (type) {
    default:
      return slideOff;
  }
  /* eslint-enable indent */
}
