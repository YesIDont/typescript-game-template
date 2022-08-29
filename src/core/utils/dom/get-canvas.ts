import { notNull } from '../not-null';
import { get } from './dom';
import { getWindowInnerSize } from './get-window-inner-size';

export type GetCanvasOptions = {
  canvasId?: string;
  width?: number;
  height?: number;
};

export function getCanvas<T = CanvasRenderingContext2D>(
  contextType: '2d' | 'webgl' = '2d',
  { canvasId, width, height }: GetCanvasOptions = { canvasId: 'canvas' },
): [HTMLCanvasElement, T] {
  const canvas = notNull<HTMLCanvasElement>(
    canvasId ? get<HTMLCanvasElement>(canvasId) : document.createElement('canvas'),
  );
  const context = notNull(canvas.getContext(contextType));

  const size = getWindowInnerSize();
  canvas.width = width ?? (size[0] || 800);
  canvas.height = height ?? (size[1] || 600);

  return [canvas, context as unknown as T];
}
