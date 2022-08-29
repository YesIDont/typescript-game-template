import { sqrt } from '../utils/math';
import { TVector } from '../vector';

/* This assumes that line and circle are overlapping with only one intersection. */
export function findLineCircleIntersection(
  cx: number,
  cy: number,
  r: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  outCoords: TVector,
): void {
  const v1x = bx - ax;
  const v1y = by - ay;
  const v2x = ax - cx;
  const v2y = ay - cy;
  const c = 2 * (v1x * v1x + v1y * v1y);
  const l = -2 * (v1x * v2x + v1y * v2y);
  let d = l * l - 2 * c * (v2x * v2x + v2y * v2y - r * r);

  // these represent the unit distance of point on the line
  d = sqrt(d);
  const u1 = (l - d) / c;

  outCoords[0] = ax + v1x * u1;
  outCoords[1] = ay + v1y * u1;
}
