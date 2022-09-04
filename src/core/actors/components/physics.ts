import { CCircle } from '../../collisions/circle';
import { CPolygon } from '../../collisions/polygon';
import { EOnHitResponseType, TCollisionResponse } from '../../collisions/responses';
import { emptyFn } from '../../utils/misc';

export type TAPhysics<T = CCircle> = {
  body: T;
  onHitType: EOnHitResponseType;
  onHit: TCollisionResponse;
};

export function physics<T = CCircle | CPolygon>(
  body: T,
  onHitType: EOnHitResponseType = 0,
  onHit: TCollisionResponse = emptyFn,
): TAPhysics<T> {
  return {
    body: body,
    onHitType,
    onHit,
  };
}
