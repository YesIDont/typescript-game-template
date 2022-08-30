import { TVector, Vector } from '../../vector';

export const getWindowInnerSize = (): TVector =>
  Vector.new(
    window.innerWidth || document.body.clientWidth || document.documentElement.clientWidth || 0,
    window.innerHeight || document.body.clientHeight || document.documentElement.clientHeight || 0,
  );
