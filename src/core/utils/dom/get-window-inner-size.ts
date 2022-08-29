import { TVector } from '../../vector';

export const getWindowInnerSize = (): TVector => [
  window.innerWidth || document.body.clientWidth || document.documentElement.clientWidth || 0,
  window.innerHeight || document.body.clientHeight || document.documentElement.clientHeight || 0,
];
