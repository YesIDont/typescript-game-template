import { cos, sin, sqrt, twoPI } from './utils/math';

export type TVector = { x: number; y: number };

export const Vector = {
  new: (x = 0, y = 0): TVector => ({ x, y }),
  length: (v: TVector): number => sqrt(v.x * v.x + v.y * v.y),
  clone: (v: TVector): TVector => ({ ...v }),
  fromRadians: (angle: number): TVector => ({ x: cos(angle), y: sin(angle) }),
  subtractNew: (vA: TVector, vB: TVector): TVector => Vector.new(vA.x - vB.x, vA.y - vB.y),

  isZero(v: TVector): boolean {
    return v.x == 0 && v.y == 0;
  },

  set(v: TVector, a = 0, b = 0): TVector {
    v.x = a;
    v.y = b;

    return v;
  },

  getLength(v: TVector): number {
    return sqrt(v.x * v.x + v.y * v.y);
  },

  add(vA: TVector, vB: TVector): TVector {
    vA.x += vB.x;
    vA.y += vB.y;

    return vA;
  },

  subtract(vA: TVector, vB: TVector): TVector {
    vA.x -= vB.x;
    vA.y -= vB.y;

    return vA;
  },

  multiply(vA: TVector, vB: TVector): TVector {
    vA.x *= vB.x;
    vA.y *= vB.y;

    return vA;
  },

  normalize(v: TVector): TVector {
    const l = this.getLength(v);
    v.x /= l;
    v.y /= l;

    return v;
  },

  rotate(v: TVector, radians: number): TVector {
    const c = cos(radians);
    const s = sin(radians);

    const { x, y } = v;
    v.x = x * c - y * s;
    v.y = x * s - y * c;

    return v;
  },

  clamp(v: TVector, maxValue: number, minValue = 0): TVector {
    const { x, y } = v;
    v.x = x > maxValue ? maxValue : x < minValue ? minValue : x;
    v.y = y > maxValue ? maxValue : y < minValue ? minValue : y;

    return v;
  },

  normalizedAandB(A: TVector, B: TVector): TVector {
    let v = Vector.subtractNew(A, B);
    v = this.normalize(v);

    return v;
  },

  randomUnit(multiplier = 1): TVector {
    const randomAngle = Math.random() * twoPI;

    return { x: Math.cos(randomAngle) * multiplier, y: Math.sin(randomAngle) * multiplier };
  },
};
