import { AActorBase } from '../actors/new-actor';
import { TShape } from './proxyTypes';
import { TCollisionResult } from './types';

export enum EOnHitResponseType {
  none = 0,
  slideOff = 1,
}

export type TCollisionResponse = (
  now: number,
  deltaSeconds: number,
  body: TShape,
  otherBody: TShape,
  otherActor: AActorBase,
  result: TCollisionResult,
) => void;

export function slideOff(
  now: number,
  deltaSeconds: number,
  body: TShape,
  otherBody: TShape,
  otherActor: AActorBase,
  result: TCollisionResult,
): void {
  const [overlap, overlapX, overlapY] = result;
  body.x -= overlap * overlapX;
  body.y -= overlap * overlapY;
}
