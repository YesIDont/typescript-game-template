import { cos, sin, sqrt, twoPI } from './utils/math';

export type TVector = [number, number];

const x = 0;
const y = 1;

export const Vector = {
  new: (xIn = 0, yIn = 0): TVector => [xIn, yIn],
  length: (v: TVector): number => sqrt(v[x] * v[x] + v[y] * v[y]),
  clone: (v: TVector): TVector => [...v],
  fromRadians: (angle: number): TVector => [Math.cos(angle), Math.sin(angle)],

  set(v: TVector, a = 0, b = 0): TVector {
    v[x] += a;
    v[y] += b;

    return v;
  },

  getLength(v: TVector): number {
    return sqrt(v[x] * v[x] + v[y] * v[y]);
  },

  add(vA: TVector, vB: TVector): TVector {
    vA[x] += vB[x];
    vA[y] += vB[y];

    return vA;
  },

  subtract(vA: TVector, vB: TVector): TVector {
    vA[x] -= vB[x];
    vA[y] -= vB[y];

    return vA;
  },

  multiply(vA: TVector, vB: TVector): TVector {
    vA[x] *= vB[x];
    vA[y] *= vB[y];

    return vA;
  },

  normalize(v: TVector): TVector {
    const l = this.getLength(v);
    v[x] /= l;
    v[y] /= l;

    return v;
  },

  rotate(v: TVector, radians: number): TVector {
    const c = cos(radians);
    const s = sin(radians);

    const [x_, y_] = v;
    v[x] = x_ * c - y_ * s;
    v[y] = x_ * s - y_ * c;

    return v;
  },

  clamp(v: TVector, maxValue: number, minValue = 0): TVector {
    const [x_, y_] = v;
    v[x] = x_ > maxValue ? maxValue : x_ < minValue ? minValue : x_;
    v[y] = y_ > maxValue ? maxValue : y_ < minValue ? minValue : y_;

    return v;
  },

  randomUnit(multiplier = 1): TVector {
    const randomAngle = Math.random() * twoPI;

    return [Math.cos(randomAngle) * multiplier, Math.sin(randomAngle) * multiplier];
  },
};
