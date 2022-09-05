import { CCircle } from '../../collisions/circle';
import { EOnHitResponseType, TCollisionResponse } from '../../collisions/responses';
import { emptyFn } from '../../utils/misc';

export type Physics<T = CCircle> = {
  body: T;
  onHitType: EOnHitResponseType;
  onHit: TCollisionResponse;
};

export function physics<TRootBody>(
  body: TRootBody,
  onHitType: EOnHitResponseType = 0,
  onHit: TCollisionResponse = emptyFn,
): Physics<TRootBody> {
  return {
    body: body,
    onHitType,
    onHit,
  };
}
