import { TVector, Vector } from '../vector';

export const { abs, atan2, cos, PI, pow, round, sin, sqrt, random, max, min, sign } = Math;
export const halfPI = PI * 0.5;
export const twoPI = 2 * Math.PI;

// clamping / mapping

export const clamp = (value: number, minIn: number, maxIn: number): number =>
  value > maxIn ? maxIn : value < minIn ? minIn : value;

export const mapRange = (
  mappedValue: number,
  inMin = -1,
  inMax = 1,
  outMin = 0,
  outMax = 1,
): number => ((mappedValue - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;

export const mapRangeClamped = (
  mappedValue: number,
  inMin = -1,
  inMax = 1,
  outMin = 0,
  outMax = 1,
): number =>
  min(
    outMax,
    max(
      outMin,

      ((mappedValue - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin,
    ),
  );

// random numbers
// -----------------------------------------------------------------------------
export const randomSign = (): number => round(random()) * 2 - 1;

export const randomInRange = (minIn: number, maxIn: number): number =>
  random() * (maxIn - minIn) + minIn;

// vectors
// -----------------------------------------------------------------------------

export const vectorToDegrees = (vector: TVector, xCompName = 'x', yCompName = 'y'): number =>
  (180 - round(180 * (atan2(vector[xCompName], vector[yCompName]) / PI))) % 360;

export const normalizeRadians = (radians: number): number => {
  if (radians > PI) return -(twoPI - radians);
  if (radians < -PI) return twoPI + radians;

  return radians;
};

export function generateScatteredVectors(radius: number, count: number): TVector[] {
  const vectors: TVector[] = [];
  let i = 0;
  for (i; i < count; i++) {
    vectors.push(Vector.new(randomInRange(-radius, radius), randomInRange(-radius, radius)));
  }

  return vectors;
}

// rotation: degrees and radians
// -----------------------------------------------------------------------------

export const interpolateRadians = (
  current: number,
  target: number,
  deltaTime: number,
  speed = 4,
): number => {
  const diff = target - current;
  const dffAbs = abs(diff);
  if (dffAbs < 0.05) return target;
  if (dffAbs > PI) return current - diff * deltaTime * speed;

  return current + diff * deltaTime * speed;
};

export const getMiddleOfTwoRadians = (a: number, b: number): number => {
  const maximum = max(a, b);
  const minimum = min(a, b);
  const result = maximum - (maximum - minimum) * 0.5;

  return abs(a) + abs(b) > PI ? result - PI : result;
};

export const flerp = (current: number, target: number, deltaTime: number, speed = 4): number => {
  const diff = target - current;
  const dffAbs = Math.abs(diff);
  if (dffAbs < 0.05) return target;

  return current + diff * deltaTime * speed;
};

export const getRadiansFromPointAtoB = (ax: number, ay: number, bx: number, by: number): number => {
  return -atan2(ax - bx, ay - by);
};
