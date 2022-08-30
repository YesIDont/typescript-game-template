import { setRequestAnimationFrame } from './requestAnimationFrame';

export const polyfills: (() => void)[] = [setRequestAnimationFrame];
