import { twoPI } from '../utils/math';
import { CBody } from './body';
import { TShape } from './proxyTypes';

export class CCircle extends CBody {
  radius: number;
  scale: number;

  constructor(x = 0, y = 0, radius = 0, tag = 0, scale = 1, padding = 0) {
    super(x, y, padding, tag);

    this.radius = radius;
    this.scale = scale;
  }

  draw(context: CanvasRenderingContext2D): void {
    const { x, y, radius: radiusWithoutScale, scale, debugDraw } = this;
    const { drawType, color } = debugDraw;
    const radius = radiusWithoutScale * scale;

    context[`${drawType}Style`] = color;
    context.beginPath();
    context.arc(x, y, radius, 0, twoPI);
    context[drawType]();
  }
}

export const Circle = (x = 0, y = 0, radius = 0, tag = 0, scale = 1, padding = 0): TShape =>
  new CCircle(x, y, radius, tag, scale, padding) as TShape;
